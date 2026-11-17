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


class MyEventSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)
    tickets_sold = serializers.IntegerField(read_only=True)
    revenue = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Event
        fields = ("id", "name", "date_time", "venue", "tickets_sold", "revenue")


class CreateEventTierSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    price = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0)


class CreateEventSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    date_time = serializers.DateTimeField()
    venue_id = serializers.IntegerField()
    ticket_tiers = CreateEventTierSerializer(many=True, allow_empty=False)

    def validate_venue_id(self, value):
        user = self.context["request"].user
        if not Venue.objects.filter(id=value, owner=user).exists():
            raise serializers.ValidationError("Choose one of your venues.")
        return value


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


class TicketTierDetailSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source="event.name", read_only=True)

    class Meta:
        model = TicketTier
        fields = ("id", "name", "price", "event_name")


class TicketDetailSerializer(serializers.ModelSerializer):
    tier = TicketTierDetailSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = ("id", "tier")


class OrderDetailSerializer(serializers.ModelSerializer):
    tickets = TicketDetailSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Order
        fields = ("id", "customer", "tickets", "total_price", "created_at")
