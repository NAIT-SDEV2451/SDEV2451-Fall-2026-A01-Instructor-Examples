# remember this file will include the mappings to
# all the views to the urls.
from django.urls import path, include

# include the drf router which shortens up the url
# creation.
from rest_framework.routers import DefaultRouter

# let's import our views
from fleet.views import (
    FleetStatsView,
    DriverViewSet,
    VehicleViewSet,
    TripViewSet,
)

# let's use our router to define all of the urls
# for get put patch post delete for a viewset
router = DefaultRouter()
router.register("drivers", DriverViewSet, basename="driver")
router.register("vehicles", VehicleViewSet, basename="vehicle")
router.register("trips", TripViewSet, basename="trip")


# api views are in url patterns
urlpatterns = [
    path(
        "stats/",
        FleetStatsView.as_view(),  # CBV notation from last semester
        name="fleet-stats",
    ),
]
