from django.contrib.auth import get_user_model
from rest_framework.permissions import BasePermission

User = get_user_model()


# Use together with IsAuthenticated, since anonymous users have no role.
class IsEventOrganizer(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.ROLE_EVENT_ORGANIZER
