from django.contrib import admin

# include allows use to import from a custom app or
# a third party app.
from django.urls import path, include

# I want to include the fleet urls.
urlpatterns = [
    path("admin/", admin.site.urls),
    path(
        "api/v1/",
        include("fleet.urls"),
    ),
]
