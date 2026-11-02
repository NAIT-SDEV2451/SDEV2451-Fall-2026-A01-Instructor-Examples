from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


# What are the tests that we're going to write
class UserRegistrationViewTestCase(APITestCase):
    register_url = "/api/v1/auth/register/"

    # - post request successfully creates user (201)
    def test_register_user_correctly_and_return_201(self):
        payload = {
            "username": "some_user_name",
            "email": "some_user@test.com",
            "password": "12kjflakjsdgbklj2b3",
        }
        # call the item
        response = self.client.post(self.register_url, payload)

        # assert a user is created and 201 is the status
        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.count(), 1)

    # - incomplete information returns a bad request (400)
    def test_register_with_missing_fields_fails_with_400(self):
        bad_payload = {"username": "some_user_name"}
        response = self.client.post(self.register_url, bad_payload)

        # no user, bad request.
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 0)

    # - we're going ot check that we can't have a duplicate
    #   username
    def test_register_with_duplicate_user_fails_with_400(self):
        SAMPLE_USER_NAME = "gary_ricks"
        # create a user
        User.objects.create(
            username=SAMPLE_USER_NAME,
            email="test@test.com",
            role="user",
        )
        # register a user with the same name
        payload = {
            "username": SAMPLE_USER_NAME,
            "email": "some_user@test.com",
            "password": "12kjflakjsdgbklj2b3",
        }
        # call the item
        response = self.client.post(self.register_url, payload)

        # assert that only one exists and get a 400 status code
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 1)  # the one we created


# MeView
class MeViewTestCase(APITestCase):
    me_url = "/api/v1/auth/me/"

    # remember this runs before all tests.
    def setUp(self):
        # create a user
        self.user = User.objects.create(
            username="gary_ricks",
            email="test@test.com",
            role="user",
        )

    # - the view responds with the correct user information.
    def test_me_returns_user_data(self):
        # force auth
        self.client.force_authenticate(user=self.user)
        # get the endpoint
        response = self.client.get(self.me_url)
        # assert the data.
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.data["id"], self.user.id)
        self.assertEqual(response.data["username"], self.user.username)
        self.assertEqual(response.data["email"], self.user.email)
        self.assertEqual(response.data["role"], self.user.role)

    # - if you're not logged you don't get anything.
    def test_me_requires_auth_returns_400_for_not_authed(self):
        # try without authenticating
        response = self.client.get(self.me_url)

        # check to see the status code.
        self.assertEqual(response.status_code, 401)
