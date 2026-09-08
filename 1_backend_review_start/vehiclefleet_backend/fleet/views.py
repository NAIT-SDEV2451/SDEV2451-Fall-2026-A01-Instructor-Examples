from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

# from our own code.
from fleet.models import Driver, Trip, Vehicle
from fleet.serializers import (
    DriverSerializer,
    VehicleSerializer,
    TripSerializer,
)


# we're going to create a view that just gives us the count
# of all of the items.
class FleetStatsView(APIView):
    # Note: permissions are AllowAny by default based on settings.py
    # define the GET request only
    def get(self, request):
        # to the user we're going to return a json
        # object with the count of all of the vehicles
        # we can do this using the orm.
        return Response(
            {
                "total_vehicles": Vehicle.objects.count(),
                "total_drivers": Driver.objects.count(),
                "total_trips": Trip.objects.count(),
            }
        )
        # here we're querying our database rather than defining and
        # populating in previous steps.


# let's use our knowledge of model viewsets which will create
# the get, put, patch, post, delete endpoints without writing a ton
# of code here.
class VehicleViewSet(ModelViewSet):
    # what is the default queryset (think orm) from the DB
    queryset = Vehicle.objects.all()
    # define how we're going to serialize that data
    serializer_class = VehicleSerializer


# same thing for the driver.
class DriverViewSet(ModelViewSet):
    # what is the default queryset (think orm) from the DB
    queryset = Driver.objects.all()
    # define how we're going to serialize that data
    serializer_class = DriverSerializer


class TripViewSet(ModelViewSet):
    serializer_class = TripSerializer

    # what we can do is instead of defining "queryset" class field,
    # we can define the function "get_queryset" this is handy when
    # you need the user.
    def get_queryset(self):
        # this is getting from the database "select_related" is an
        # optimization that we'll discuss later in the semester
        return Trip.objects.select_related("vehicle", "driver").all()
