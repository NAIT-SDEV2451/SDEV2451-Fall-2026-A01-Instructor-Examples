# for the responses status
from rest_framework import status

# import some permissions
from rest_framework.permissions import (
    AllowAny,  # any one can access
    IsAuthenticated,  # only auth access.
)
from rest_framework.response import Response
from rest_framework.views import APIView

# let's import our serializer
from .serializers import UserRegistrationSerializer


# first view is goign to be the registration.
class UserRegistrationView(APIView):
    # permission class everyone needs to be able to access
    permission_classes = (AllowAny,)  # this is a tuple

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # .save() calls either .create (in our serializer )
            # or .update (if it's existing.)
            return Response(
                {"message": "User registered Successfully"},
                status=status.HTTP_201_CREATED,
            )
        # we need to handle the error case!
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# second is going to show the user information.
class MeView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        # the user part of the request is inside the
        # the request gives a token, and the framework returns
        # the user itself.
        user = request.user
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            }
        )
