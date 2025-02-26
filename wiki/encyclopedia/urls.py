from django.urls import path

from . import views
app_name = "encyclopedia"

urlpatterns = [
    path("", views.index, name="index"),
    path("error", views.error, name="error"),
    path("add", views.add, name="add"),
    path("<str:title>", views.entry, name="entry"),
    path("wiki/<str:title>", views.entry, name="entry"),

]
