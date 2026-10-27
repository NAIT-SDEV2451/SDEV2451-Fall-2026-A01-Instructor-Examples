from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Event, Order, Ticket, TicketTier
from .serializers import (
    CreateNewOrderSerializer,
    EventListReadOnlySerializer,
    OrderSerializer,
    OrderDetailSerializer,
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


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)

    # we we're going to change this because we want
    # to use a different serializer depending on
    # what request method we're using.
    # serializer_class = OrderSerializer

    def get_serializer_class(self):
        # get requests
        # you can also check for self.request.method
        # or in viewset actions
        # list, retrieve.
        # i want to use my new serializer
        if self.action in ["list", "retrieve"]:
            # note on the above, if you create a custom
            # action you need to include the method name
            # in the action check.
            return OrderDetailSerializer
        # our "post/patch"
        # or in viewset actions
        # create, update, partial_update
        return OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = CreateNewOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        tickets = []
        for item in serializer.validated_data["items"]:
            tier = TicketTier.objects.get(id=item["ticket_tier_id"])
            for _ in range(item["quantity"]):
                tickets.append(Ticket.objects.create(tier=tier))

        order = Order.objects.create(customer=request.user)
        order.tickets.set(tickets)

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
