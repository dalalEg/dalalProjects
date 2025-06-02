from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User ,Post, Follow, Like
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
import json


def index(request):
        # Authenticated users view their inbox
    if request.user.is_authenticated:
        # Fetch the latest posts from users they follow
        following = Follow.objects.filter(follower=request.user).values_list('following', flat=True)
        posts = Post.objects.filter(user__in=following).order_by('-created_at')
        
        # Paginate the posts
        paginator = Paginator(posts, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        return render(request, "network/index.html", {
            "posts": page_obj,
            "user": request.user,
        })
    # Unauthenticated users view the public feed
    else:
        # Fetch the latest posts from all users
        posts = Post.objects.all().order_by('-created_at')
        
        # Paginate the posts
        paginator = Paginator(posts, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        return render(request, "network/index.html", {
            "posts": page_obj,
            "user": None,
        })



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if not username or not password:
            return render(request, "network/login.html", {
                "message": "Username and password are required."
            })
        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

    
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        if not username or not password or not email or not confirmation:
            return render(request, "network/register.html", {
                "message": "All fields are required."
            })
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
def profile(request):
    if request.method == "GET":
        # Return the profile of the logged-in user
        user = User.objects.get(username=request.user.username)
        posts = Post.objects.filter(user=user).order_by('-created_at')
        follwers= Follow.objects.filter(following=user).count()
        following = Follow.objects.filter(follower=user).count()
        paginator = Paginator(posts, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        all_users = User.objects.filter(is_active=True)
        return JsonResponse({
            "username": user.username,
            "email": user.email,
            "posts": [post.serialize() for post in page_obj],
            "followers": follwers,
            "following": following,
            "all_users": [u.username for u in all_users],
        }, safe=False)



def posts(request):
    if request.method == "GET":
        # Return all posts
        posts = Post.objects.all().order_by('-created_at')
        paginator = Paginator(posts, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        return JsonResponse({
            "posts": [post.serialize() for post in page_obj]
        }, safe=False)
    elif request.method == "POST":
        # Create a new post
        try:
            data = json.loads(request.body)
            content = data.get("content", "").strip()
            if not content:
                return JsonResponse({"error": "Content cannot be empty."}, status=400)

            post = Post(user=request.user, content=content)
            post.save()
            return JsonResponse(post.serialize(), status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON."}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

def spa_shell(request):
    return render(request, "network/index.html")