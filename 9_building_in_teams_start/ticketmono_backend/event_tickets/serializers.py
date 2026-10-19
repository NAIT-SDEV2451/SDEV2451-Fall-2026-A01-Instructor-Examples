from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Event, TicketTier, Venue, Order

User = get_user_model()


# all for events
class TicketTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketTier
        fields = ("id", "name", "price")


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = ("id", "name", "address")


class OrganizerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "role")


class EventListReadOnlySerializer(serializers.ModelSerializer):
    ticket_tiers = TicketTierSerializer(many=True, read_only=True)
    venue = VenueSerializer(read_only=True)
    organizer = OrganizerSerializer(read_only=True)

    class Meta:
        model = Event
        fields = ("id", "name", "date_time", "venue", "organizer", "ticket_tiers")


# create an order.
# for each item in our cart we're going to create a ticket.
class CreateNewOrderItemSerializer(serializers.Serializer):
    event_id = serializers.IntegerField()
    ticket_tier_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


# a list of these
class CreateNewOrderSerializer(serializers.Serializer):
    # on the frontend we're going to pass in a list of new order items.
    items = CreateNewOrderItemSerializer(many=True)


# display the order serializer
class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("id", "customer", "tickets", "created_at")
