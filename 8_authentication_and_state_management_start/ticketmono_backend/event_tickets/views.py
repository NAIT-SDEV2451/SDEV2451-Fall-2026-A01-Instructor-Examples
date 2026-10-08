from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny

from .models import Event
from .serializers import EventListReadOnlySerializer


# note you could also use a "ReadOnlyModelViewset"
class EventViewSet(ModelViewSet):
    queryset = Event.objects.select_related(
        # optimize to select with joins.
        "venue",
        "organizer",
    ).prefetch_related(
        "ticket_tiers"  # another optimization
    )

    permission_classes = [AllowAny]

    serializer_class = EventListReadOnlySerializer
