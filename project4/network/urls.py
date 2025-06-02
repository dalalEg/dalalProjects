from django.urls import path, re_path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("register/", views.register, name="register"),
    path("posts/", views.index, name="post"),
    path("api/profile/", views.profile, name="profile"), 
    path('api/profile/<str:username>/', views.profile, name='profile'),
    path("api/posts/", views.posts, name="posts"),
    # to refresh the page
    re_path(r'^(?!api/).*$', views.spa_shell, name="spa_shell"),
]
