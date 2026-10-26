from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Event, Order, Ticket, TicketTier, Venue

User = get_user_model()


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


class CreateNewOrderItemSerializer(serializers.Serializer):
    event_id = serializers.IntegerField()
    ticket_tier_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class CreateNewOrderSerializer(serializers.Serializer):
    items = CreateNewOrderItemSerializer(many=True)


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("id", "customer", "tickets", "created_at")


# for our order confirmation page.
# tickettierdetail serializer
class TicketTierDetailSerializer(serializers.ModelSerializer):
    # event name is not a model field on the model of
    # ticket tier, so we're going to make a char field
    # that takes in the event name from the source.
    event_name = serializers.CharField(
        source="event.name",
        read_only=True,
    )

    class Meta:
        model = TicketTier
        fields = ["id", "name", "price", "event_name"]


# ticket detail serializer
class TicketDetailSerializer(serializers.ModelSerializer):
    # link the nested serializer
    tier = TicketTierDetailSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = ["id", "tier"]


# orderdetailserializer (read only here.)
class OrderDetailSerializer(serializers.ModelSerializer):
    tickets = TicketDetailSerializer(
        many=True,  # multiple tickets to an order
        read_only=True,
    )
    # total price is not a model field so we need to
    # serialize it using our knowledge of fields
    total_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "customer",
            "tickets",
            "total_price",
            "created_at",
        ]
