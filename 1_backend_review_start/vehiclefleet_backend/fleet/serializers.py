# we are going to create a serializer for each of these.
# using django rest framework for this.
from rest_framework import serializers  # brings in the library

# import all of my models
from fleet.models import Driver, Trip, Vehicle


# the model serializer converts the database column/fields into a
# json serializable format, and also adds the deserialization validation
# so that you don't have junk in your database.
# you can always take a look here: https://www.django-rest-framework.org/api-guide/serializers/#drf-pydantic
class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle  # the orm model
        fields = "__all__"  # this means all of the columns.


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver  # the orm model
        fields = "__all__"  # this means all of the columns.


# with the trip serializer we're going to make it a bit different
# because we're going add some information here from the other
# serializers.
class TripSerializer(serializers.ModelSerializer):
    # for the read serializers to have a better representation of the data
    # we want to show the nested fields with the above.
    vehicle_detail = VehicleSerializer(source="vehicle", read_only=True)
    driver_detail = DriverSerializer(source="driver", read_only=True)

    # the read only here will only be on GETs
    # note the "vehicle" and "driver" in the above are the database model instance fields.

    class Meta:
        model = Trip
        fields = [
            # is the primary key (added automatically to all model instances)
            "id",
            # I'm going to include the vehicle/driver for writing only
            # this will take an id.
            "vehicle",
            "driver",
            # we also need to include the readonly fields which will refer
            # to the fields we've declared.
            "vehicle_detail",
            "driver_detail",
            # your plain old columns
            "start_location",
            "end_location",
            "start_time",
            "end_time",
            "distance",
        ]
        # extra kwargs which explicitly set the vehicle and driver to write only.
        extra_kwargs = {
            "vehicle": {"write_only": True},
            "driver": {"write_only": True},
        }
