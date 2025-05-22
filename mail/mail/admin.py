from django.contrib import admin

# Register your models here.
from .models import User, Email


class UserAdmin(admin.ModelAdmin):
    filter_horizontal = ("auctions",)

admin.site.register(User)
admin.site.register(Email)
