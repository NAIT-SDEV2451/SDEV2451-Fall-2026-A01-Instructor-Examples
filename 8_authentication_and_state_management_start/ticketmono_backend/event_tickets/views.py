from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated

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
    serializer_class = EventListReadOnlySerializer

    # permission_classes = [AllowAny]
    # we have different permissions for listing events and get events

    def get_permissions(self):
        # all viewsets have the following actions: list, create, retrieve, update, partial_update, destroy.
        # https://www.django-rest-framework.org/api-guide/viewsets/#viewset-actions
        if self.action == "list":
            permission_classes = [AllowAny]
        elif self.action == "retrieve":
            permission_classes = [IsAuthenticated]
        # return the generator of all permissions
        return [permission() for permission in permission_classes]
