# we're going to need timedelta to subtract time.
from datetime import timedelta

# import django timezone which is how we get datetimenow that tz aware.
from django.utils import timezone

# we're going to import truncweek which is a db function
from django.db.models.functions import TruncWeek

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

        # weekly average distance, avg in groups of weeks.

        # filter the last 12 months of data.
        twelve_months_ago = timezone.now() - timedelta(weeks=52)
        weekly_avg_distance = list(  # we're making a list of value rather than a queryset.
            Trip.objects.filter(
                start_time__gte=twelve_months_ago,  # start before 12 months ago. __gte is greater or equal than
                distance__isnull=False,  # we're selecting all distance that arent' null
            )
            .annotate(
                # annotate (create a new field) of the week, do it with some db functions
                week=TruncWeek("start_time"),  # a new field called week.
            )
            .values("week")
            .annotate(
                # annotate a second value for the average distance per week.
                avg_distance=Avg("distance")  # creating a new field called avg_distance
            )
            .order_by("week")
            .values_list("week", "avg_distance")
        )
        # formatting the dates in a nicer format.
        formatted_weekly_avg_distance = []
        for weekly_avg_item in weekly_avg_distance:
            formatted_weekly_avg_distance.append(
                {
                    "week": weekly_avg_item[0].strftime("%Y-%m-%d"),
                    "avg_distance": round(float(weekly_avg_item[1]), 2),
                }
            )
        return Response(
            {
                "avg_distance_per_week": formatted_weekly_avg_distance,
                "average_distance": round(avg, 2),
                "total_vehicles": Vehicle.objects.count(),
                "total_drivers": Driver.objects.count(),
                "total_trips": Trip.objects.count(),
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
