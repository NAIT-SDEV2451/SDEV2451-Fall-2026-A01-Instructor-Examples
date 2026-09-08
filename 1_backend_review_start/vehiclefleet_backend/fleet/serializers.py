# we are going to create a serializer for each of these.
# using django rest framework for this.
from rest_framwork import serializers  # brings in the library

# import all of my models
from fleet.models import Driver, Trip, Vehicle

# the model serializer converts the database column/fields into a
# json serializable format, and also adds the deserialization validation
# so that you don't have junk in your database.
