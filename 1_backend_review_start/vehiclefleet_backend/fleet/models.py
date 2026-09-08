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
class Driver(models.Model):
    name = models.CharField(max_length=150)
    # but you don't want two folks with the same number
    # so you can enforce this with unique in the table so
    # now two rows will be equal.
    license_number = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=20, blank=True)
    # maybe in the future this would be a foreignkey
    # to a user/profile that can authenticate into the account.
    email = models.EmailField(blank=True)


# In the future we might want to consider some of these tables.
# manufacturer?
# location?


# trip
class Trip(models.Model):
    # this is going to have a foreign key to both tables.
    vehicle = models.ForeignKey(
        Vehicle,  # note: in some instances it might be better to write this as a string
        on_delete=models.CASCADE,  # if you delete a vehicle, it'll delete the trips.
        related_name="trips",  # how to get related trips on the vehicle instance
    )
