# we are going to create a serializer for each of these.
# using django rest framework for this.
from rest_framwork import serializers  # brings in the library

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
