from django.shortcuts import render
from django import forms 
from django.http import HttpResponseRedirect
from django.shortcuts import render 
import markdown2 as markdown
from django.urls import reverse


from . import models

from . import util


def index(request):

    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def entry(request, title):
    content = util.get_entry(title)
    if content is None:
        return render(request, 'encyclopedia/error.html', {'entry': title})   
    content = markdown.markdown(content)
    return render(request, 'encyclopedia/entry.html',
                   {'entry': title, 'content': content})

def error(request):
    return render(request, "encyclopedia/error.html")

def add(request):
    return render(request, "encyclopedia/add.html")