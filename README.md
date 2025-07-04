# 🌐 CS50 Web Programming Projects

This repository contains completed projects from **CS50’s Web Programming with Python and JavaScript**, offered by Harvard University. The course focuses on full-stack web development, including frontend and backend technologies such as HTML, CSS, JavaScript, Python, Django, SQL, and Git.

---

## 🌐 Network
A Twitter-style social network built with Django and JavaScript as part of CS50W Project 4.

### Features
- User registration, login, logout, and session handling

- Create, edit, and like/unlike posts

- Follow/unfollow users with follower/following lists

- Dynamic profile pages with user stats

- Comments on posts with timestamps and sorting

- Pagination across posts and profiles

- SPA behavior via JavaScript (history.pushState, fetch, etc.)

### Extras

- View who liked or commented on posts via profile

- Navigate directly to user profiles via clickable usernames

- Friendly URLs like /profile/<username> and /posts/<id>

- Only owners can edit their posts or delete their comments

### 🚧 Coming Soon
- Delete comment functionality

- Threaded replies to comments (nested discussion)
 - Highlight active user in followers/following lists

---

## 📬 Mail

A single-page email client built using **JavaScript, HTML, and CSS**, interacting with a RESTful backend.

### Features
- Send and receive emails.
- View email details and reply.
- Archive and unarchive messages.
- Dynamic UI updates using pure JavaScript and Fetch API.
- View switching and state management inside a single JavaScript file (`inbox.js`).

### Skills:  
JavaScript, DOM Manipulation, Fetch API, REST, UI State, HTML/CSS

---

## 🛒 Commerce

An eBay-style **auction site** built with Django.

### Features
- Create, bid on, and comment on auction listings.
- Category browsing and user watchlists.
- Login and registration with Django authentication.
- Automatically closes listings when auctions end.

### Skills:  
Django, Python, Models & Migrations, HTML Templates, User Auth, Forms

---

## 📚 Wiki

A simple Wikipedia-style **encyclopedia** app using Django and Markdown.

### Features
- Create, edit, and search encyclopedia entries.
- Markdown-to-HTML conversion for article display.
- Error handling for duplicates and missing entries.
- Random article functionality.

### Skills:  
Django, Markdown, HTML Templates, Form Handling, Search Logic

---

## 🧠 Coming Soon: More Projects

More projects from CS50W such as:
- Capstone project (optional final independent full-stack project)

---

## 🛠️ Technologies Used

- Python • Django • JavaScript • HTML • CSS
- Git & GitHub • SQLite • Markdown

---

## 📂 Setup Instructions
🛠️ Getting Started
To clone and run this repository locally:

1. Clone the repository
 ``` bash
 git clone https://github.com/dalalEg/CS50W.git
 cd CS50W
 ```
2. Set up a virtual environment (recommended)
 ```bash
 python -m venv venv
 source venv/bin/activate  # On Windows use: venv\Scripts\activate
```
3. Install dependencies
 Each project has its own Django app and requirements.txt (if needed).
 You can install Django globally or per project:
 pip install django
 Or install from a specific project's requirements.txt (if available):
 ``` bash
 cd project4  # Or wiki, commerce, etc.
 pip install -r requirements.txt
 ```
4. Run the server
 ```bash
 python manage.py migrate
 python manage.py runserver
```
Then visit http://127.0.0.1:8000 in your browser.
