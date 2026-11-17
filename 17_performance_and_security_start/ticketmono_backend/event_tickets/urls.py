from rest_framework.routers import DefaultRouter

from .views import EventViewSet, OrderViewSet, VenueViewSet

router = DefaultRouter()
router.register("events", EventViewSet, basename="event")
router.register("venues", VenueViewSet, basename="venue")
router.register("orders", OrderViewSet, basename="order")

urlpatterns = router.urls
