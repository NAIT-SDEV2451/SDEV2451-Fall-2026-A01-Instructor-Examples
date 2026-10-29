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
