# let's create the user register serializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

# we're going to import the hashing for the password.
from django.contrib.auth.hashers import make_password

# this is goign to be the custom user.
User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    # you could also make the password 1 and 2
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",  # this uses the field above.
            "role",
        ]

        extra_kwargs = {
            "email": {"required": True},
            "role": {"required": False},  # the default is just user
        }

    # let's add a validator that will return the hashed password
    def validate_password(self, value):
        return make_password(value)

    def create(self, validated_data):
        # we could also send a welcome email here
        # this is the orm.

        return User.objects.create(
            **validated_data,
            # the above converts the object to params.
        )
