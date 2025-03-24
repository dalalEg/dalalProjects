from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from decimal import Decimal
from .models import User, Auction, Comment,Bid, Category
from django.contrib.auth import update_session_auth_hash


def index(request):
     auctions = Auction.objects.all().filter(active=True)
     return render(request, "auctions/index.html", {
                "auctions": auctions
            })


def listingPage(request, auction_id):
    
    auction = Auction.objects.get(pk=auction_id)
    if not auction.active:
          return render(request, "auctions/closedPage.html", {
                "auction": auction
            })
    User = request.user
    if User.is_authenticated:
        if request.method == "POST":
            if request.POST.get("bid"):
                if User== auction.user:
                    return render(request, "auctions/listingPage.html", {
                        "auction": auction,
                        "message": "You cannot bid on your own auction"
                    })
                if User == auction.current:
                    return render(request, "auctions/listingPage.html", {
                        "auction": auction,
                        "message": "You are already the highest bidder"
                    })
                bid = request.POST["bid"]
                if Decimal(bid) > auction.starting_bid:
                    auction.starting_bid = bid
                    auction.current = User
                    auction.save()
                    Bid.objects.create(value=bid, user=User, auction=auction)
                else:   
                    return render(request, "auctions/listingPage.html", {
                        "auction": auction,
                        "message": "Bid must be higher than the starting bid"
                    })
            if request.POST.get("comment"): 
                comment = request.POST["comment"]
                comment=Comment(text=comment, user=User, auction=auction)
                comment.save()
            if request.POST.get("watchlist") == "add":
                User.watchlist.add(auction)
            if request.POST.get("watchlist") == "remove":
                User.watchlist.remove(auction)
            if request.POST.get("close") == "close":
                auction.active = False
                winner =auction.current
                if winner != None:
                    winner.won_auctions.add(auction)
                auction.save()
                return HttpResponseRedirect(reverse("index"))
            watchlist = User.watchlist.filter(pk=auction_id).exists()
            comments = Comment.objects.all().filter(auction=auction)
            return render(request, "auctions/listingPage.html", {
                "auction": auction,
                "watchlist": watchlist,
                "comments": comments
            })
        # Check if auction is in the user's watchlist (for GET request)
        watchlist = User.watchlist.filter(pk=auction_id).exists()
        comments = Comment.objects.all().filter(auction=auction)
        return render(request, "auctions/listingPage.html", {
                "auction": auction,
                "watchlist": watchlist,
                "comments": comments
            })
    else:
        
        return render(request, "auctions/listingPage.html", {
            "auction": auction
        })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if not password or not username:
            return render(request, "auctions/login.html", {
                "message": "Please fill out all fields."
            })
        # Check if authentication successful
        if user is not None:
            login(request, user)
            auctions= user.auctions.all().filter(active=True)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
        if not password or not confirmation or not username or not email:
            return render(request, "auctions/register.html", {
                "message": "Please fill out all fields."
            })
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


def create(request):
    if request.method == "POST":
        
        if request.POST.get("category"):
            category=Category.objects.get(id=request.POST.get("category"))
        else:
            category=Category.objects.get(name="Other")
        title = request.POST["title"]
        description = request.POST["description"]
        starting_bid = request.POST["starting_bid"]
        image = None
        if  request.POST["image_url"]:
            image = request.POST["image_url"]
        user = request.user
        auction = Auction(title=title, description=description, starting_bid=starting_bid, image=image, category=category, user=user, active=True, current=None)
        auction.save()
        return HttpResponseRedirect(reverse("index"))
    else:    
        return render(request, "auctions/create.html", {
            "categories": Category.objects.all()
        })




@login_required
def watchlist(request):
    User = request.user
    watchlist = User.watchlist.all().filter(active=True)
    return render(request, "auctions/watchlist.html", {
        "watchlist": watchlist
    })
def categories(request):
    categories = Category.objects.all()
    return render(request, "auctions/categories.html", {
        "categories": categories
    })
  
def category(request, category):
    category = Category.objects.get(name=category)
    category_id = category.id  # Use the numeric ID, not the string
    auctions = Auction.objects.all().filter(category=category_id, active=True)
    return render(request, "auctions/category.html", {
        "category": category,
        "auctions": auctions,
        
    })

@login_required
def profile(request):
    User = request.user
    auctions = User.auctions.all()
    won = User.won_auctions.all().filter(active=False)
    comments=Comment.objects.all().filter(user=User)
    bids = Bid.objects.all().filter(user=User)
    return render(request, "auctions/profile.html", {
        "auctions": auctions,
        "won": won,
        "comments": comments,
        "bids": bids
    })

def closed(request, auction_id):
    auction = Auction.objects.get(pk=auction_id)
    return render(request, "auctions/listingPage.html", {
        "auction": auction
    })


def changePassword(request):
    if request.method == "POST":
        user = request.user
        password = request.POST["old_password"]
        if not user.check_password(password):
            return render(request, "auctions/changePassword.html", {
                "message": "Invalid password."
            })
        new_password = request.POST["new_password"]
        confirmation = request.POST["new_password2"]
        if new_password != confirmation:
            return render(request, "auctions/changePassword.html", {
                "message": "Passwords must match."
            })
        if not user.set_password(new_password):
            return render(request, "auctions/changePassword.html", {
                "message": "Password must be at least 8 characters long."
            })
        user.save()
        update_session_auth_hash(request, user) 
        return render(request, "auctions/changePassword.html", {
            "message": "Password changed successfully."
        })
    else:
        return render(request, "auctions/changePassword.html")
    
def addCategory(request):
    if request.method == "POST":
        new_category = request.POST.get("new_category", "").strip()
        
        if new_category:
            # Check if the category already exists
            if Category.objects.filter(name=new_category).exists():
                return render(request, "auctions/addCategory.html", {
                    "message": f"Category '{new_category}' already exists."
                })
            else:
                # Create the new category
                Category.objects.create(name=new_category)
                return HttpResponseRedirect(reverse("create"))  # Redirect to the create page
        else:
         return render(request, "auctions/addCategory.html", {
            "message": "Category name cannot be empty."
        })
    else:
        return render(request, "auctions/addCategory.html")
        
      
def bids(request):
    User = request.user
    bids = Bid.objects.all().filter(user=User)
    return render(request, "auctions/bids.html", {
        "bids": bids
    })

def auctions(request):
    User = request.user
    auctions = User.auctions.all()
    return render(request, "auctions/listing.html", {
        "auctions": auctions
    })

def won(request):
    User = request.user
    won = User.won_auctions.all().filter(active=False)
    return render(request, "auctions/won.html", {
        "won": won
    })

def comments(request):
    User = request.user
    comments = Comment.objects.all().filter(user=User)
    return render(request, "auctions/comments.html", {
        "comments": comments
    })