# in our serializers
from django.contrib.auth import get_user_model
from rest_framework.serializers import ModelSerializer

from .models import Event, TicketTier, Venue

User = get_user_model()


# 3 serializers before our EventListReadOnlySerializers
class TicketTierSerializer(ModelSerializer):
    class Meta:
        model = TicketTier
        fields = ["id", "price", "name"]


class VenueSerializer(ModelSerializer):
    class Meta:
        model = Venue
        fields = ["id", "name", "address"]


class OrganizerSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "role"]


class EventListReadOnlySerializer(ModelSerializer):
    # show the nested representation of the foreign key fields
    venue = VenueSerializer(read_only=True)
    organizer = OrganizerSerializer(read_only=True)
    # note: for ticket tiers you need to specify many=True
    ticket_tiers = TicketTierSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "date_time",
            "venue",  # reference to a single item
            "organizer",  # reference to a single item
            "ticket_tiers",  # remember this will be many
        ]
