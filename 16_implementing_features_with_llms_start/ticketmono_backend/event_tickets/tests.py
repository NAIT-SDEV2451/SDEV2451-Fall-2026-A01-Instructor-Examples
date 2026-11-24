from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Event, Order, Ticket, TicketTier, Venue

User = get_user_model()


class EventTicketsTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            role='attendee',
        )
        self.organizer = User.objects.create_user(
            username='organizer',
            password='testpass123',
            role='organizer',
        )
        self.venue = Venue.objects.create(
            name='Test Venue',
            address='123 Test St',
            owner=self.organizer,
        )
        self.event = Event.objects.create(
            name='Test Event',
            date_time=timezone.now(),
            venue=self.venue,
            organizer=self.organizer,
        )
        self.tier = TicketTier.objects.create(
            name='General Admission',
            price='25.00',
            event=self.event,
        )

    def test_order_total_price(self):
        ticket_1 = Ticket.objects.create(tier=self.tier)
        ticket_2 = Ticket.objects.create(tier=self.tier)
        order = Order.objects.create(customer=self.user)
        order.tickets.set([ticket_1, ticket_2])

        self.assertEqual(order.total_price, 50)

    def test_events_list_requires_authentication(self):
        response = self.client.get('/api/v1/events/')

        self.assertEqual(response.status_code, 401)

    def test_authenticated_user_can_list_events(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/events/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_create_order(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'items': [
                {
                    'event_id': self.event.id,
                    'ticket_tier_id': self.tier.id,
                    'quantity': 2,
                }
            ]
        }
        response = self.client.post('/api/v1/orders/', payload, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Order.objects.count(), 1)
        order = Order.objects.first()
        self.assertEqual(order.customer, self.user)
        self.assertEqual(order.tickets.count(), 2)

    def test_user_cannot_see_other_users_orders(self):
        other_user = User.objects.create_user(
            username='other',
            password='testpass123',
            role='attendee',
        )
        ticket = Ticket.objects.create(tier=self.tier)
        other_order = Order.objects.create(customer=other_user)
        other_order.tickets.set([ticket])

        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/orders/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_create_order_requires_authentication(self):
        payload = {
            'items': [
                {
                    'event_id': self.event.id,
                    'ticket_tier_id': self.tier.id,
                    'quantity': 1,
                }
            ]
        }
        response = self.client.post('/api/v1/orders/', payload, format='json')

        self.assertEqual(response.status_code, 401)
        self.assertEqual(Order.objects.count(), 0)

    def test_order_detail_returns_nested_tickets(self):
        ticket = Ticket.objects.create(tier=self.tier)
        order = Order.objects.create(customer=self.user)
        order.tickets.set([ticket])

        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/v1/orders/{order.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertIn('tickets', response.data)
        self.assertEqual(len(response.data['tickets']), 1)
        self.assertIn('tier', response.data['tickets'][0])
        self.assertEqual(response.data['tickets'][0]['tier']['name'], 'General Admission')
        self.assertIn('total_price', response.data)


class MyEventsTestCase(APITestCase):
    url = '/api/v1/events/mine/'

    def setUp(self):
        self.customer = User.objects.create_user(
            username='customer',
            password='testpass123',
            role=User.ROLE_USER,
        )
        self.organizer = User.objects.create_user(
            username='organizer',
            password='testpass123',
            role=User.ROLE_EVENT_ORGANIZER,
        )
        self.other_organizer = User.objects.create_user(
            username='other_organizer',
            password='testpass123',
            role=User.ROLE_EVENT_ORGANIZER,
        )
        self.venue = Venue.objects.create(
            name='Test Venue',
            address='123 Test St',
            owner=self.organizer,
        )
        # Created in the opposite order to their dates.
        self.upcoming_event = self.create_event('Upcoming Event', self.organizer, days=7)
        self.past_event = self.create_event('Past Event', self.organizer, days=-7)
        self.other_event = self.create_event('Other Event', self.other_organizer, days=3)

        self.general = TicketTier.objects.create(
            name='General Admission', price='25.00', event=self.upcoming_event
        )
        self.vip = TicketTier.objects.create(
            name='VIP', price='60.50', event=self.upcoming_event
        )
        self.past_tier = TicketTier.objects.create(
            name='General Admission', price='10.00', event=self.past_event
        )
        self.other_tier = TicketTier.objects.create(
            name='General Admission', price='99.00', event=self.other_event
        )

    def create_event(self, name, organizer, days):
        return Event.objects.create(
            name=name,
            date_time=timezone.now() + timedelta(days=days),
            venue=self.venue,
            organizer=organizer,
        )

    def sell(self, tier, quantity):
        tickets = [Ticket.objects.create(tier=tier) for _ in range(quantity)]
        order = Order.objects.create(customer=self.customer)
        order.tickets.set(tickets)
        return tickets

    def get_my_events(self):
        self.client.force_authenticate(user=self.organizer)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        return response.data

    def test_my_events_requires_authentication(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 401)

    def test_regular_user_cannot_get_my_events(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 403)

    def test_organizer_only_gets_their_own_events_and_sales(self):
        self.sell(self.general, 1)
        self.sell(self.other_tier, 5)

        data = self.get_my_events()

        names = {event['name'] for event in data['events']}
        self.assertEqual(names, {'Upcoming Event', 'Past Event'})
        self.assertEqual(
            data['totals'],
            {'events': 2, 'tickets_sold': 1, 'revenue': '25.00'},
        )

    def test_sales_are_added_up_per_event_and_in_totals(self):
        self.sell(self.general, 2)
        self.sell(self.vip, 1)
        self.sell(self.past_tier, 3)

        data = self.get_my_events()

        events = {event['name']: event for event in data['events']}
        self.assertEqual(events['Upcoming Event']['tickets_sold'], 3)
        self.assertEqual(events['Upcoming Event']['revenue'], '110.50')
        self.assertEqual(events['Past Event']['tickets_sold'], 3)
        self.assertEqual(events['Past Event']['revenue'], '30.00')
        self.assertEqual(
            data['totals'],
            {'events': 2, 'tickets_sold': 6, 'revenue': '140.50'},
        )

    def test_event_includes_its_venue(self):
        data = self.get_my_events()

        self.assertEqual(
            data['events'][0]['venue'],
            {'id': self.venue.id, 'name': 'Test Venue', 'address': '123 Test St'},
        )

    def test_tickets_without_an_order_are_not_sold(self):
        Ticket.objects.create(tier=self.general)

        data = self.get_my_events()

        self.assertEqual(data['totals']['tickets_sold'], 0)
        self.assertEqual(data['totals']['revenue'], '0.00')

    def test_ticket_in_two_orders_is_counted_once(self):
        tickets = self.sell(self.general, 1)
        second_order = Order.objects.create(customer=self.customer)
        second_order.tickets.set(tickets)

        data = self.get_my_events()

        self.assertEqual(data['totals']['tickets_sold'], 1)
        self.assertEqual(data['totals']['revenue'], '25.00')

    def test_status_depends_on_the_event_date(self):
        data = self.get_my_events()

        statuses = {event['name']: event['status'] for event in data['events']}
        self.assertEqual(
            statuses, {'Upcoming Event': 'upcoming', 'Past Event': 'past'}
        )

    def test_events_are_ordered_by_date(self):
        data = self.get_my_events()

        names = [event['name'] for event in data['events']]
        self.assertEqual(names, ['Past Event', 'Upcoming Event'])

    def test_organizer_with_no_events(self):
        Event.objects.filter(organizer=self.organizer).delete()

        data = self.get_my_events()

        self.assertEqual(data['events'], [])
        self.assertEqual(
            data['totals'],
            {'events': 0, 'tickets_sold': 0, 'revenue': '0.00'},
        )

    def test_query_count_does_not_grow_with_events(self):
        for number in range(5):
            event = self.create_event(f'Event {number}', self.organizer, days=1)
            TicketTier.objects.create(name='GA', price='5.00', event=event)

        # One query for the events and one for their tiers.
        with self.assertNumQueries(2):
            self.get_my_events()
