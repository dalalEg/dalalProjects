from django.contrib import admin

from .models import User, Post, Follow, Like, Comment

class UserAdmin(admin.ModelAdmin):
    pass  # No filter_horizontal unless you have a many-to-many field

admin.site.register(User, UserAdmin)
admin.site.register(Post)
admin.site.register(Follow)
admin.site.register(Like)
admin.site.register(Comment)