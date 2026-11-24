from decimal import Decimal

from django.db.models import Count, Prefetch, Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsEventOrganizer

from .models import Event, Order, Ticket, TicketTier
from .serializers import (
    CreateNewOrderSerializer,
    EventListReadOnlySerializer,
    MyEventSerializer,
    OrderDetailSerializer,
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

    @action(
        detail=False,
        methods=["get"],
        permission_classes=(IsAuthenticated, IsEventOrganizer),
    )
    def mine(self, request):
        # A ticket is sold if it belongs to an order. distinct stops a ticket
        # that is in more than one order from being counted twice.
        tiers = TicketTier.objects.annotate(
            tickets_sold=Count(
                "tickets", filter=Q(tickets__orders__isnull=False), distinct=True
            )
        )
        # prefetch_related(None) clears the viewset's plain ticket_tiers prefetch,
        # which would conflict with the annotated one.
        events = (
            self.get_queryset()
            .filter(organizer=request.user)
            .prefetch_related(None)
            .prefetch_related(Prefetch("ticket_tiers", queryset=tiers))
            .order_by("date_time")
        )
        data = MyEventSerializer(events, many=True).data
        revenue = sum(Decimal(event["revenue"]) for event in data)

        return Response({
            "totals": {
                "events": len(data),
                "tickets_sold": sum(event["tickets_sold"] for event in data),
                "revenue": f"{revenue:.2f}",
            },
            "events": data,
        })


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return OrderDetailSerializer
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
