from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.urls import reverse

from .models import User ,Post, Follow, Like, Comment
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
import json


def index(request):
        # Authenticated users view their inbox
    return render(request, "network/index.html")

@csrf_exempt
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

@csrf_exempt
def posts(request):
    if not request.user.is_authenticated or  request.method == "GET":
        # Return all posts
        posts = Post.objects.all().order_by('-created_at')
        paginator = Paginator(posts, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        data = []
        for post in page_obj:
            data.append({
                "id": post.id,
                "user": post.user.username,
                "content": post.content,
                "timestamp": post.created_at.strftime("%Y-%m-%d %H:%M"),
                "likes_count": post.likes_count,
                "updated_at": post.updated_at.strftime("%Y-%m-%d %H:%M"),
                "is_liked": Like.objects.filter(user=request.user, post=post).exists() if request.user.is_authenticated else False,
            })

        return JsonResponse({
            "posts": data,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous()
        })
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

@login_required
def profile(request):
    user = User.objects.get(username=request.user.username)
    all_param = request.GET.get('all')
    if all_param == 'true':
        posts = Post.objects.filter(user=user).order_by('-created_at')
        return JsonResponse({
            "all_posts": [post.serialize() for post in posts]
        })
    if request.method == "GET":
        # Return the profile of the logged-in user
        user = User.objects.get(username=request.user.username)
        posts = Post.objects.filter(user=user).order_by('-created_at')
        followers= Follow.objects.filter(following=user).count()
        following = Follow.objects.filter(follower=user).count()
        paginator = Paginator(posts, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        all_users = User.objects.filter(is_active=True)
        #all_users = all_users.exclude(username=request.user.username)  # Exclude the current user
        return JsonResponse({
            "username": user.username,
            "email": user.email,
            "posts": [post.serialize() for post in page_obj],
            "followers": followers,
            "following": following,
            "all_users": [u.username for u in all_users],
            "followers_list": [f.follower.username for f in Follow.objects.filter(following=user)],
            "following_list": [f.following.username for f in Follow.objects.filter(follower=user)],
        }, safe=False)

@csrf_exempt
@login_required
def other_profile(request, username):
    if request.method == "GET":
        # Return the profile of the specified user
        try:
            user = User.objects.get(username=username)
            posts = Post.objects.filter(user=user).order_by('-created_at')
            followers = Follow.objects.filter(following=user).count()
            following = Follow.objects.filter(follower=user).count()
            paginator = Paginator(posts, 10)
            page_number = request.GET.get('page')
            page_obj = paginator.get_page(page_number)
            return JsonResponse({
                "username": user.username,
                "email": user.email,
                "posts": [post.serialize() for post in page_obj],
                "followers": followers,
                "following": following,
                "is_following": Follow.objects.filter(follower=request.user, following=user).exists(),
                "is_their_profile": request.user.username == username,
                "followers_list": [f.follower.username for f in Follow.objects.filter(following=user)],
                "following_list": [f.following.username for f in Follow.objects.filter(follower=user)],
                

            }, safe=False)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)
    else:#follow or unfollow a user
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)

        try:
            user = User.objects.get(username=username)
            if request.method == "POST":
                # Check if the user is trying to follow themselves
              
                # Follow the user
                follow, created = Follow.objects.get_or_create(follower=request.user, following=user)
                if created:
                    return JsonResponse({"message": f"You are now following {username}."}, status=201)
                else:
                    return JsonResponse({"message": f"You are already following {username}."}, status=200)
            elif request.method == "DELETE":
                # Unfollow the user
                follow = Follow.objects.filter(follower=request.user, following=user).first()
                if follow:
                    follow.delete()
                    return JsonResponse({"message": f"You have unfollowed {username}."}, status=200)
                else:
                    return JsonResponse({"error": "You are not following this user."}, status=404)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)

@login_required
def following(request):
    if request.method == "GET":
        # Return the list of users that the logged-in user is following
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)

        following = Follow.objects.filter(follower=request.user)
        posts = Post.objects.filter(user__in=[follow.following for follow in following]).order_by('-created_at')
        paginator = Paginator(posts, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        data = []
        for post in page_obj:
            data.append({
                "id": post.id,
                "user": post.user.username,
                "content": post.content,
                "timestamp": post.created_at.strftime("%Y-%m-%d %H:%M"),
                "likes_count": post.likes_count,
                "updated_at": post.updated_at.strftime("%Y-%m-%d %H:%M"),
                "is_liked": Like.objects.filter(user=request.user, post=post).exists() if request.user.is_authenticated else False,
            })
        return JsonResponse({
            "posts": data,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous()
        })
@csrf_exempt
@login_required
def like_post(request, post_id):
    if not request.user.is_authenticated:
        
        return JsonResponse({"error": "Authentication required."}, status=401)

    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    if request.method == "POST":
        # Like the post
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if created:
            post.likes_count += 1
            post.save()
        # Always return the current state
        return JsonResponse({
            "message": "Post liked.",
            "likes_count": post.likes_count,
            "is_liked": True
        }, status=201)

    elif request.method == "DELETE":
        # Unlike the post
        like = Like.objects.filter(user=request.user, post=post).first()
        if like:
            like.delete()
            post.likes_count -= 1
            post.save()
        # Always return the current state
        return JsonResponse({
            "message": "Post unliked.",
            "likes_count": post.likes_count,
            "is_liked": False
        }, status=200)
def post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    user = request.user
    is_owner = user.is_authenticated and post.user == user
    is_liked = user.is_authenticated and Like.objects.filter(user=user, post=post).exists()
    can_like = user.is_authenticated
    can_edit = is_owner
    if request.method == "GET":
        return JsonResponse({
            "id": post.id,
            "user": post.user.username,
            "content": post.content,
            "updated_at": post.updated_at.strftime("%Y-%m-%d %H:%M"),
            "likes_count": post.likes_count,
            "is_liked": is_liked,
            "can_like": can_like,
            "can_edit": True if can_edit else False,

        })
    elif request.method == "PUT" and can_edit:
        data = json.loads(request.body)
        post.content = data.get("content", post.content)
        post.save()
        return JsonResponse({"content": post.content})
    elif request.method == "DELETE":
        # Delete the post
        post.delete()
        return JsonResponse({"message": "Post deleted."}, status=204)
    
def spa_shell(request):
    return render(request, "network/index.html")

def userPosts(request, username):
    try:
        user = User.objects.get(username=username)
        posts = Post.objects.filter(user=user).order_by('-created_at')
        paginator = Paginator(posts, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        data = [post.serialize() for post in page_obj]
        return JsonResponse({
            "username": user.username,
            "posts": data,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous()
        })
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    

@csrf_exempt
def comment(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    if request.method == "GET":
        comments = post.comments.order_by('created_at')
        return JsonResponse({"comments": [c.serialize() for c in comments]})
    elif request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Login required."}, status=401)
        data = json.loads(request.body)
        content = data.get("content", "").strip()
        if not content:
            return JsonResponse({"error": "Comment cannot be empty."}, status=400)
        comment = Comment.objects.create(user=request.user, post=post, content=content)
        return JsonResponse(comment.serialize(), status=201)
    else:
        return JsonResponse({"error": "Method not allowed."}, status=405)
    

@login_required
def user_comments(request, username):
    try:
        user = User.objects.get(username=username)
        comments = Comment.objects.filter(user=user).order_by('-created_at')
        paginator = Paginator(comments, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        data = [comment.serialize() for comment in page_obj]
        return JsonResponse({
            "username": user.username,
            "comments": data,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous()
        })
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
@login_required
def user_likes(request, username):
    try:
        user = User.objects.get(username=username)
        likes = Like.objects.filter(user=user).order_by('-created_at')
        paginator = Paginator(likes, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        data = [
            {
                "post_id": like.post.id,
                "post_content": like.post.content,
                "user": like.post.user.username,
                "liked_at": like.post.created_at.strftime("%Y-%m-%d %H:%M"),
            }
            for like in page_obj
        ]
        return JsonResponse({
            "username": user.username,
            "likes": data,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous()
        })
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)