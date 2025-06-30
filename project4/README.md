# Social Network - CS50 Web Programming Project 4

A Django-powered social network app that mimics core features of platforms like Twitter or Facebook. Users can register, log in, post updates, follow others, like/unlike posts, comment, and explore other users' profiles.

---

## 🚀 Features

### ✅ Core Functionality
- **User Authentication**
  - Register, login, logout
  - Session-based authentication using Django

- **Posting**
  - Create new posts with content
  - Edit own posts (inline editing)
  - Pagination for all post views
  - Single post view with like/comment support

- **Following System**
  - Follow and unfollow users
  - View list of followers and following
  - Click usernames to navigate to their profiles
  - Highlight current user in the list  (in process)

- **Profiles**
  - View any user's profile
  - See their posts, likes, and comments
  - View own profile with same features

- **Likes**
  - Like/unlike posts
  - Dynamic update of like count and state

- **Comments**
  - Add comments to posts
  - View all comments (newest first)
  - Timestamps on comments (relative time e.g. "5 minutes ago") (in process)
  - Comments displayed in dedicated section per post 

---

## 🧩 Extra Features
- **Profile Enhancements**
  - Profiles display total likes and comments made by the user

- **Interactive Follower/Following Pages**
  - Clicking "Followers" or "Following" shows a list of users
  - Clicking a username takes you to their profile

- **Dynamic Frontend**
  - Render pages dynamically with JavaScript (SPA-style)
  - `history.pushState` used for clean URL navigation

---

## 🛠 Upcoming Features

- [ ] **Delete Own Comments**
  - Allow users to remove their own comments

- [ ] **Threaded Comments**
  - Reply to specific comments (nested comment threads)

- [ ] **Notification System**
  - Receive alerts for new likes, comments, or follows

- [ ] **Comment Timestamp Formatting**
  - Human-readable format (e.g., "2 hours ago")

- [ ] **Post Sorting & Filtering**
  - Add filters to view most liked, recent, or followed posts

---

## 📦 Tech Stack

- **Backend**: Django, Django ORM
- **Frontend**: HTML, CSS (Bootstrap), JavaScript (Vanilla)
- **Database**: SQLite (default, can be switched to PostgreSQL)
- **Auth**: Django’s built-in user system
- **API**: REST-like endpoints with JSON responses

---

## 📸 Screenshots 

---

## 👩‍💻 Author

Dalal Eghbaria — (www.linkedin.com/in/dalal-eghbaria-a9283820a)

---

## 💡 License

This project is part of the [CS50 Web Programming](https://cs50.harvard.edu/web/) course and is open for educational and personal use.
