from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from authentication.models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    pass
