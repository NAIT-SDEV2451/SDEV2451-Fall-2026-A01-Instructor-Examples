from django.db import transaction
from django.db.models import Count, DecimalField, Sum, Value
from django.db.models.functions import Coalesce
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Event, Order, Ticket, TicketTier, Venue
from .permissions import IsEventOrganizer, IsOrganizer
from .serializers import (
    CreateEventSerializer,
    CreateNewOrderSerializer,
    EventListReadOnlySerializer,
    MyEventSerializer,
    OrderDetailSerializer,
    OrderSerializer,
    VenueSerializer,
)


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related("venue", "organizer").prefetch_related(
        "ticket_tiers"
    )

    def get_permissions(self):
        if self.action in ("create", "mine"):
            return [IsAuthenticated(), IsOrganizer()]
        if self.action in ("update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsEventOrganizer()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "list":
            return EventListReadOnlySerializer
        return EventListReadOnlySerializer

    def create(self, request, *args, **kwargs):
        serializer = CreateEventSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # The event and its tiers are saved together or not at all.
        with transaction.atomic():
            event = Event.objects.create(
                name=data["name"],
                date_time=data["date_time"],
                venue_id=data["venue_id"],
                organizer=request.user,
            )
            for tier in data["ticket_tiers"]:
                TicketTier.objects.create(
                    event=event, name=tier["name"], price=tier["price"]
                )

        return Response(
            EventListReadOnlySerializer(event).data, status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=["get"])
    def mine(self, request):
        # Totals are calculated by the database so each row doesn't need its own query.
        events = (
            Event.objects.filter(organizer=request.user)
            .select_related("venue")
            .annotate(
                tickets_sold=Count("ticket_tiers__tickets"),
                revenue=Coalesce(
                    Sum("ticket_tiers__tickets__tier__price"),
                    Value(0),
                    output_field=DecimalField(max_digits=10, decimal_places=2),
                ),
            )
            .order_by("date_time")
        )
        return Response(MyEventSerializer(events, many=True).data)


class VenueViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = VenueSerializer
    permission_classes = (IsAuthenticated, IsOrganizer)

    def get_queryset(self):
        return Venue.objects.filter(owner=self.request.user)


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
