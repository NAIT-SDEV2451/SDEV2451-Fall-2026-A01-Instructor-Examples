from rest_framework.views import APIView
from rest_framework.response import Response

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
