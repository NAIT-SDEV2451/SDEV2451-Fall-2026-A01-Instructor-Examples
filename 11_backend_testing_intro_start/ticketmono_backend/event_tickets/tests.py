from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

# we're going to use APITestCase from rest framework which is an extension
# of test case.
from rest_framework.test import APITestCase

from .models import Event, Order, Ticket, TicketTier, Venue

User = get_user_model()
# Create your tests here.


class EventTicketsTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            role="attendee",
        )
        self.organizer = User.objects.create_user(
            username="organizer",
            password="testpass123",
            role="organizer",
        )
        self.venue = Venue.objects.create(
            name="Test Venue",
            address="123 Test St",
            owner=self.organizer,
        )
        self.event = Event.objects.create(
            name="Test Event",
            date_time=timezone.now(),
            venue=self.venue,
            organizer=self.organizer,
        )
        self.tier = TicketTier.objects.create(
            name="General Admission",
            price="25.00",
            event=self.event,
        )

    def test_order_total_price(self):
        # create a couple tickets (the tier is 25 bucks)
        ticket_one = Ticket.objects.create(tier=self.tier)
        ticket_two = Ticket.objects.create(tier=self.tier)
        # create an order
        order = Order.objects.create(customer=self.user)
        # set the order tickets
        order.tickets.set([ticket_one, ticket_two])

        # assert that they're the same.
        EXPECTED_COST = 50
        self.assertEqual(order.total_price, EXPECTED_COST)

    # we're going to test our application
    # by hitting the endpoints in drf
    # with api test case you can get
    # a lot of functionality.

    def test_events_list_requires_authentication(self):
        # the "self.client" allow us to make requests
        # to the backend.
        response = self.client.get("/api/v1/events/")

        # in general in testing, what you're testing
        # is on the left and what you expect is on
        # the right.
        self.assertEqual(
            response.status_code,
            401,
        )

    # we're going to use "force_authenticate" on the
    # client to simulate a authentication.
    def test_authenticated_user_can_list_events(self):
        # we're going to force the auth
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/v1/events/")

        # two assertions, one for status code
        # one for body/data
        self.assertEqual(response.status_code, 200)
        # in this test I'm checking for a single event.
        EXPECTED_NUM_EVENTS = 1
        self.assertEqual(
            len(response.data),  # return events
            EXPECTED_NUM_EVENTS,  # we have a single event
        )

    # the two tests above are doing integration tests.
    # they are testing urls, the views, the serializers, the models.

    def test_create_order(self):
        # force auth with self.user
        self.client.force_authenticate(user=self.user)
        # create a payload with the event above
        # tier the above,
        # quantity of 2
        payload = {
            "items": [
                {
                    "event_id": self.event.id,
                    "ticket_tier_id": self.tier.id,
                    "quantity": 2,
                }
            ]
        }

        # post to orders endpoint
        response = self.client.post(
            "/api/v1/orders/",
            payload,
            format="json",
        )

        # assert status codes
        self.assertEqual(response.status_code, 201)

        # assert order counts
        self.assertEqual(Order.objects.count(), 1)
        # get the order
        order = Order.objects.first()
        # assert that the customer is the user
        self.assertEqual(order.customer, self.user)

        # the tickets
        self.assertEqual(
            order.tickets.count(),
            2,
        )

    def test_user_cannot_see_other_users_orders(self):
        # let's create another users
        other_user = User.objects.create_user(
            username="other",
            password="testpass123",
            role="attendee",
        )
        # create an order for them
        ticket = Ticket.objects.create(tier=self.tier)
        other_order = Order.objects.create(
            customer=other_user,
        )
        other_order.tickets.set([ticket])

        # login as the existing user
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/v1/orders/")

        EXPECTED_NUM_ORDERS_OF_USER = 0
        # and ensure that they can't see the order.
        self.assertEqual(
            len(response.data),
            EXPECTED_NUM_ORDERS_OF_USER,
        )
