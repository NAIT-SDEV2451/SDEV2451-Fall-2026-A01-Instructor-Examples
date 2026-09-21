# import the average here.
from django.db.models import Count, Avg
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from fleet.models import Driver, Trip, Vehicle
from fleet.serializers import DriverSerializer, TripSerializer, VehicleSerializer


class FleetStatsView(APIView):

    def get(self, request):
        # aggregate is on all of the data
        # annotate is like a group by on the data.
        # average of all distances of our trips.
        # aggregates are on the full dataset.
        avg = Trip.objects.aggregate(
            avg_distance=Avg("distance"),  # making a new field and getting that info
        )["avg_distance"]
        # the aggregate gives us a dictionary and we're accessing the key "avg_distance" that we created
        breakpoint()
        return Response(
            {
                "total_vehicles": Vehicle.objects.count(),
                "total_drivers": Driver.objects.count(),
                "total_trips": Trip.objects.count(),
                "average_distance": avg,
            }
        )


class VehicleViewSet(ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    filter_backends = [SearchFilter]
    search_fields = ["make", "model", "license_plate"]


class DriverViewSet(ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    filter_backends = [SearchFilter]
    search_fields = ["name", "license_number", "email"]


class TripViewSet(ModelViewSet):
    serializer_class = TripSerializer

    def get_queryset(self):
        return Trip.objects.select_related("vehicle", "driver").all()
