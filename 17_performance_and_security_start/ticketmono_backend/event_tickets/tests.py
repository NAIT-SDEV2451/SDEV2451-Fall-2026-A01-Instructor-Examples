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
            role='user',
        )
        self.organizer = User.objects.create_user(
            username='organizer',
            password='testpass123',
            role='event_organizer',
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
            role='user',
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


class OrganizerEventsTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            role='user',
        )
        self.organizer = User.objects.create_user(
            username='organizer',
            password='testpass123',
            role='event_organizer',
        )
        self.other_organizer = User.objects.create_user(
            username='other_organizer',
            password='testpass123',
            role='event_organizer',
        )
        self.venue = Venue.objects.create(
            name='Test Venue',
            address='123 Test St',
            owner=self.organizer,
        )
        self.other_venue = Venue.objects.create(
            name='Other Venue',
            address='456 Other St',
            owner=self.other_organizer,
        )
        self.event = Event.objects.create(
            name='Test Event',
            date_time=timezone.now(),
            venue=self.venue,
            organizer=self.organizer,
        )
        self.floor = TicketTier.objects.create(
            name='Floor',
            price='100.00',
            event=self.event,
        )
        self.balcony = TicketTier.objects.create(
            name='Balcony',
            price='40.00',
            event=self.event,
        )
        self.other_event = Event.objects.create(
            name='Other Event',
            date_time=timezone.now(),
            venue=self.other_venue,
            organizer=self.other_organizer,
        )
        self.payload = {
            'name': 'New Event',
            'date_time': '2027-01-15T19:30:00Z',
            'venue_id': self.venue.id,
            'ticket_tiers': [
                {'name': 'Floor', 'price': '120.00'},
                {'name': 'Balcony', 'price': '60.00'},
            ],
        }

    def test_my_events_is_forbidden_for_regular_users(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/events/mine/')

        self.assertEqual(response.status_code, 403)

    def test_my_events_only_returns_my_events(self):
        self.client.force_authenticate(user=self.organizer)
        response = self.client.get('/api/v1/events/mine/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual([e['id'] for e in response.data], [self.event.id])

    def test_my_events_totals_add_up_across_tiers(self):
        Ticket.objects.create(tier=self.floor)
        Ticket.objects.create(tier=self.floor)
        Ticket.objects.create(tier=self.balcony)

        self.client.force_authenticate(user=self.organizer)
        response = self.client.get('/api/v1/events/mine/')

        self.assertEqual(response.data[0]['tickets_sold'], 3)
        self.assertEqual(response.data[0]['revenue'], '240.00')

    def test_venues_only_returns_my_venues(self):
        self.client.force_authenticate(user=self.organizer)
        response = self.client.get('/api/v1/venues/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual([v['id'] for v in response.data], [self.venue.id])

    def test_organizer_can_create_event_with_tiers(self):
        self.client.force_authenticate(user=self.organizer)
        response = self.client.post('/api/v1/events/', self.payload, format='json')

        self.assertEqual(response.status_code, 201)
        event = Event.objects.get(id=response.data['id'])
        self.assertEqual(event.name, 'New Event')
        self.assertEqual(event.ticket_tiers.count(), 2)

    def test_regular_user_cannot_create_event(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/v1/events/', self.payload, format='json')

        self.assertEqual(response.status_code, 403)
        self.assertFalse(Event.objects.filter(name='New Event').exists())

    def test_create_event_ignores_organizer_in_request(self):
        self.client.force_authenticate(user=self.organizer)
        payload = {**self.payload, 'organizer': self.other_organizer.id}
        response = self.client.post('/api/v1/events/', payload, format='json')

        event = Event.objects.get(id=response.data['id'])
        self.assertEqual(event.organizer, self.organizer)

    def test_cannot_create_event_at_another_organizers_venue(self):
        self.client.force_authenticate(user=self.organizer)
        payload = {**self.payload, 'venue_id': self.other_venue.id}
        response = self.client.post('/api/v1/events/', payload, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('venue_id', response.data)

    def test_cannot_create_event_with_no_tiers(self):
        self.client.force_authenticate(user=self.organizer)
        payload = {**self.payload, 'ticket_tiers': []}
        response = self.client.post('/api/v1/events/', payload, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertFalse(Event.objects.filter(name='New Event').exists())

    def test_organizer_can_update_own_event(self):
        self.client.force_authenticate(user=self.organizer)
        response = self.client.patch(
            f'/api/v1/events/{self.event.id}/', {'name': 'Renamed'}, format='json'
        )

        self.assertEqual(response.status_code, 200)
        self.event.refresh_from_db()
        self.assertEqual(self.event.name, 'Renamed')

    def test_organizer_cannot_update_another_organizers_event(self):
        self.client.force_authenticate(user=self.organizer)
        response = self.client.patch(
            f'/api/v1/events/{self.other_event.id}/', {'name': 'Renamed'}, format='json'
        )

        self.assertEqual(response.status_code, 403)
        self.other_event.refresh_from_db()
        self.assertEqual(self.other_event.name, 'Other Event')
