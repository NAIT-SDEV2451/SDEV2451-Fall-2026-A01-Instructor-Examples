# let's create the user register serializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

# this is goign to be the custom user.
User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )
