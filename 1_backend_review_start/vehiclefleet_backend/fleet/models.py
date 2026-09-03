from django.db import models


# vehicle/car
# remember this is a database table.
# that is a python class definition.
# that's what an orm does.
class Vehicle(models.Model):
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    licence_plate = models.CharField(max_length=100)

    # in the admin when you print out the model
    # you want something intelligible
    def __str__(self):
        return f" {self.make}, {self.model}, {self.year}, ({self.licence_plate})"


# driver

# manufacturer?

# location?

# trip
