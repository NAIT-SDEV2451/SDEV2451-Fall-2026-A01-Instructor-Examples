from django.contrib import admin

from .models import Vehicle, Driver, Trips

admin.site.register(Vehicle)
admin.site.register(Driver)
admin.site.register(Trips)
