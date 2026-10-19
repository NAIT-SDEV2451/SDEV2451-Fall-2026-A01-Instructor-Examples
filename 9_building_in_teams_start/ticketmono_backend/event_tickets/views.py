from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Event, Order, TicketTier, Ticket
from .serializers import (
    EventListReadOnlySerializer,
    CreateNewOrderSerializer,
    OrderSerializer,
)


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related("venue", "organizer").prefetch_related(
        "ticket_tiers"
    )
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == "list":
            return EventListReadOnlySerializer
        return EventListReadOnlySerializer


# let's create a viewset to see all of these items
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    # only the user to see their own orders.
    # on a viewset you can access self.request.user
    def get_queryset(self):
        return Order.objects.filter(
            customer=self.request.user,
        )

    # we're going to override the create
    def create(self, request, *args, **kwargs):
        # we're going to use our create new order serializer
        serializer = CreateNewOrderSerializer(data=request.data)
        # check if it's valid
        serializer.is_valid(raise_exception=True)

        # loop through and create tickets based on the tier id
        tickets = []
        for item in serializer.validated_data["items"]:  # "items" from serializer
            # get the tier
            tier = TicketTier.objects.get(id=item["ticket_tier_id"])
            # _ means I'm not using this value.
            for _ in range(item["quantity"]):
                tickets.append(
                    Ticket.objects.create(tier=tier),
                )

        # create the order
        order = Order.objects.create(customer=request.user)
        # set the order tickets to the tickets created above
        order.tickets.set(tickets)

        # respond with our OrderSerializer with a status of 200
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )
