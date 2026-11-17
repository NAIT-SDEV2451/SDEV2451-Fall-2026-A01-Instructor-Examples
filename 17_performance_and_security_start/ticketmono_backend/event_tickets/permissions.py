from rest_framework.permissions import BasePermission

from core.models import CustomUser


class IsOrganizer(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == CustomUser.ROLE_EVENT_ORGANIZER


class IsEventOrganizer(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.organizer == request.user
