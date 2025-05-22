from django.urls import path, re_path
from . import views

urlpatterns = [
    # Auth views
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API routes — ORDER MATTERS
    path("api/emails", views.compose, name="compose"),
    path("api/emails/compose", views.compose, name="compose"),
    path("api/emails/<int:email_id>", views.email, name="email"),
    path("api/emails/<str:mailbox>/<int:email_id>", views.email, name="email"),  # Optional
    path("api/emails/<str:mailbox>", views.mailbox, name="mailbox"),

    # React frontend catch-all for /emails/*
    re_path(r"^emails/.*$", views.index, name="index"),
]
