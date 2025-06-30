document.addEventListener("DOMContentLoaded", function () {
  const profileLink = document.querySelector("#profile_link");
  if (profileLink) {
    profileLink.addEventListener("click", function () {
      renderProfile();
    });
  }

  const allPostLink = document.querySelector("#all_post_link");
  if (allPostLink) {
    allPostLink.addEventListener("click", function (event) {
      event.preventDefault();
      handleAllPostsClick();
    });
  }

  const followingLink = document.querySelector("#following_link");
  if (followingLink) {
    followingLink.addEventListener("click", function (event) {
      event.preventDefault();

      handleFollowingClick();
    });
  }

  const addLink = document.querySelector("#add_link");
  if (addLink) {
    addLink.addEventListener("click", function (event) {
      event.preventDefault();
      handleAddPostClick();
    });
  }

  const postSubmit = document.querySelector("#post_submit");
  if (postSubmit) {
    postSubmit.addEventListener("click", function () {
      handleSubmitPost();
    });
  }
  // default page load
});
window.onpopstate = function (event) {
  const currentURL = window.location.pathname;
  if (event.state) {
    // User profile (with or without username)
    if (currentURL.startsWith("/profile/")) {
      // Followers
      if (currentURL.endsWith("/followers")) {
        const username = currentURL
          .split("/profile/")[1]
          .replace("/followers", "");
        showFollowers(username);
      }
      // Following
      else if (currentURL.endsWith("/following")) {
        const username = currentURL
          .split("/profile/")[1]
          .replace("/following", "");
        showFollowing(username);
      }
      // User comments
      else if (currentURL.endsWith("/comments")) {
        const username = currentURL
          .split("/profile/")[1]
          .replace("/comments", "");
        showUserComments(username);
      }
      // User likes
      else if (currentURL.endsWith("/likes")) {
        const username = currentURL.split("/profile/")[1].replace("/likes", "");
        showUserLikes(username);
      }
      // User posts (optional, if you have a posts tab)
      else if (currentURL.endsWith("/posts")) {
        const username = currentURL.split("/profile/")[1].replace("/posts", "");
        // You may want to call a function to show all posts for this user
        renderProfile(username);
      }
      // Default: user profile
      else {
        const username = currentURL.split("/profile/")[1];
        renderProfile(username || null);
      }
    } else if (currentURL === "/profile") {
      renderProfile();
    } else if (currentURL === "/add_post") {
      showOnlySection("NewPost");
    } else if (currentURL === "/posts" || currentURL === "/") {
      handleAllPostsClick();
    } else if (currentURL === "/following") {
      handleFollowingClick();
    } else if (currentURL === "/followers") {
      showOnlySection("followers");
    } else if (currentURL.startsWith("/posts/")) {
      // Single post view
      const postId = currentURL.split("/posts/")[1];
      if (postId) {
        renderSinglePost(postId);
      } else {
        handleAllPostsClick();
      }
    }
  }
};
// Function to show only the specified section and hide others
function showOnlySection(sectionId) {
  const sections = [
    "profile",
    "NewPost",
    "posts",
    "following",
    "followers",
    "login_form",
    "register_form",
    "post",
    "all_posts",
  ];

  sections.forEach((id) => {
    const el = document.querySelector(`.${id}`);
    if (el) {
      el.style.display = id === sectionId ? "block" : "none";
    }
  });
}

// Function to handle the click event for the add post link
function handleAddPostClick() {
  showOnlySection("NewPost");
  history.pushState({ page: "add_post" }, "add_post", "/add_post");
  const postContentInput = document.querySelector("#post_content");
  if (postContentInput) {
    postContentInput.value = ""; // Clear the input field
  }
  console.log("Add post link clicked, navigating to add post page.");
}

function handleSubmitPost() {
  // Validate the post content
  console.log("Submit post button clicked.");
  const postContent = document.querySelector("#post_content").value;
  if (postContent.trim() === "") {
    alert("Post content cannot be empty.");
    return;
  }

  // Send the post content to the server
  fetch("/api/posts/", {
    method: "POST",
    credentials: "same-origin",

    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken(), // <-- Add this line
    },
    body: JSON.stringify({ content: postContent }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Post submitted successfully:", data);
      // Optionally, redirect to the posts page or update the UI
      handleAllPostsClick();
    })
    .catch((error) => {
      alert("There was a problem with the post submission: " + error.message);
      console.error("Error submitting post:", error);
    });
}

// Function to handle the click event for the all posts link
function handleAllPostsClick(page = 1) {
  showOnlySection("posts");
  renderPosts({
    apiUrl: "/api/posts/",
    containerSelector: ".posts",
    page,
    title: "All Posts",
    pushState: true,
    stateObj: { page: "posts" },
    urlPath: "/posts",
  });
}

function renderPosts({
  apiUrl,
  containerSelector,
  page = 1,
  title = "Posts",
  pushState = true,
  stateObj = {},
  urlPath = "",
}) {
  //push history state
  history.pushState(
    { ...stateObj, page_num: page },
    title.toLowerCase(),
    `${urlPath}?page=${page}`,
  );

  // Show the posts section
  fetch(`${apiUrl}?page=${page}`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken(),
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      if (pushState) {
        history.pushState(
          { ...stateObj, page_num: page },
          title.toLowerCase(),
          `${urlPath}?page=${page}`,
        );
      }

      const posts_content = document.createElement("div");
      posts_content.innerHTML = `
      <h1>${title}</h1>
      ${data.posts
        .map(
          (post) => `
        <div class="post-card" data-post-id="${post.id}" style="cursor:pointer;">
          <div class="post-header">${post.user}</div>
          <div class="post-meta">${post.updated_at}</div>
          <div class="post-content">${post.content}</div>
          <div class="post-footer">
            <span>Likes: <span class="like-count">${post.likes_count}</span></span>
            <button class="like-btn btn btn-sm ${post.is_liked ? "btn-danger" : "btn-outline-primary"}">
              ${post.is_liked ? "Unlike" : "Like"}
            </button>
          </div>
        </div>
      `,
        )
        .join("")}
      <div class="pagination">
        <button id="prev-page" ${!data.has_previous ? "disabled" : ""}>Previous</button>
        <button id="next-page" ${!data.has_next ? "disabled" : ""}>Next</button>
      </div>
    `;
      const postsContainer = document.querySelector(containerSelector);
      if (postsContainer) {
        postsContainer.innerHTML = "";
        postsContainer.appendChild(posts_content);

        // Like/Unlike event listeners
        posts_content.querySelectorAll(".like-btn").forEach((btn) => {
          btn.addEventListener("click", function () {
            if (window.userIsAuthenticated !== "true") {
              alert("You must be signed in to like posts.");
              return;
            }
            const postCard = this.closest(".post-card");
            const postId = postCard.getAttribute("data-post-id");
            const likeCountSpan = postCard.querySelector(".like-count");
            const isLiked = this.textContent === "Unlike";

            fetch(`/api/posts/${postId}/like/`, {
              method: isLiked ? "DELETE" : "POST",
              credentials: "same-origin",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
              },
            })
              .then((response) => response.json())
              .then((data) => {
                likeCountSpan.textContent = data.likes_count;
                this.textContent = data.is_liked ? "Unlike" : "Like";
                this.className = `like-btn btn btn-sm ${data.is_liked ? "btn-danger" : "btn-outline-primary"}`;
              })
              .catch((error) => {
                console.error(
                  "There was a problem with the like/unlike operation:",
                  error,
                );
              });
          });
        });

        // Pagination handlers
        posts_content.querySelector("#prev-page").onclick = function () {
          if (data.has_previous)
            renderPosts({
              apiUrl,
              containerSelector,
              page: page - 1,
              title,
              pushState,
              stateObj,
              urlPath,
            });
        };
        posts_content.querySelector("#next-page").onclick = function () {
          if (data.has_next)
            renderPosts({
              apiUrl,
              containerSelector,
              page: page + 1,
              title,
              pushState,
              stateObj,
              urlPath,
            });
        };

        // Add click event to each post card
        posts_content.querySelectorAll(".post-card").forEach((card) => {
          card.addEventListener("click", function (e) {
            // Prevent like button from triggering post view
            if (e.target.classList.contains("like-btn")) return;
            const postId = this.getAttribute("data-post-id");
            renderSinglePost(postId);
          });
        });
      } else {
        console.error("Posts container not found.");
      }
    })
    .catch((error) => {
      alert("There was a problem with the fetch operation: " + error.message);
    });
}

function renderProfile(username = null) {
  showOnlySection("profile");
  let url, pushStateObj, pushUrl;
  if (username) {
    url = `/api/profile/${username}/`;
    pushStateObj = { page: "profile", username };
    pushUrl = `/profile/${username}`;
  } else {
    url = "/api/profile/";
    pushStateObj = { page: "profile" };
    pushUrl = "/profile";
  }
  //push history state
  // This will update the URL in the browser without reloading the page
  // and allow the user to navigate back to this state.
  history.pushState(pushStateObj, "profile", pushUrl);
  // Fetch profile data
  fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      document.querySelector(".profile").innerHTML = "";
      history.pushState(pushStateObj, "profile", pushUrl);

      const profile_content = document.createElement("div");
      profile_content.innerHTML = `
        <h1>${data.username}'s Profile</h1>
        <p>
          <span id="followers-link" style="cursor:pointer; color:#007bff; text-decoration:underline;">
            Followers: ${data.followers}
          </span>
          &nbsp;|&nbsp;
          <span id="following-link" style="cursor:pointer; color:#007bff; text-decoration:underline;">
            Following: ${data.following}
          </span>
        </p>
        ${username ? `<button id="follow-btn">${data.is_following ? "Unfollow" : "Follow"}</button>` : ""}
        <h3>
          <span id="show-all-posts" style="cursor:pointer; color:#007bff; text-decoration:underline;">Posts</span>:
        </h3>
        <ul id="profile-posts-list">
          ${data.posts.map((post) => `<li>${post.content} (${post.updated_at})</li>`).join("")}
        </ul>
        ${
          !username
            ? `
        <h3>All Usernames:</h3>
        <ul>
          ${data.all_users
            .map(
              (u) =>
                `<li><a href="#" class="user-link" data-username="${u}">${u}</a></li>`,
            )
            .join("")}
        </ul>
        `
            : ""
        }
 <div style="margin-top:20px;">
          <a href="#" id="show-user-comments" style="margin-right:20px; color:#007bff; text-decoration:underline;">All Comments</a>
          <a href="#" id="show-user-likes" style="color:#007bff; text-decoration:underline;">All Likes</a>
        </div>
      `;

      document.querySelector(".profile").append(profile_content);

      // Only show follow/unfollow for other users
      if (username) {
        const followBtn = document.getElementById("follow-btn");
        if (data.is_their_profile) {
          followBtn.style.display = "none";
        } else {
          followBtn.style.display = "block";
          let isFollowing = data.is_following;
          followBtn.onclick = function () {
            fetch(`/api/profile/${username}/`, {
              method: isFollowing ? "DELETE" : "POST",
              credentials: "same-origin",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
              },
            })
              .then((response) => response.json())
              .then((response) => {
                renderProfile(username);
              })
              .catch((error) => {
                console.error(
                  "There was a problem with the follow/unfollow operation:",
                  error,
                );
              });
          };
        }
      }

      // Add event listeners for user links (only on own profile)
      if (!username) {
        document.querySelectorAll(".user-link").forEach((link) => {
          link.addEventListener("click", function (e) {
            e.preventDefault();
            const uname = this.dataset.username;
            renderProfile(uname);
          });
        });
      }

      const showAllPosts = document.getElementById("show-all-posts");
      if (showAllPosts) {
        showAllPosts.addEventListener("click", function () {
          // Show all posts for this user
          showOnlySection("posts");
          // Update the URL and history state
          history.pushState(
            { page: "profile", showAll: true, username: data.username },
            `${data.username}'s All Posts`,
            `/profile/${data.username}?all=true`,
          );

          // Render all posts for this user
          // Use the same renderPosts function but with the all=true parameter
          // This assumes the API supports a query parameter to fetch all posts
          const url = `/api/profile/${data.username}/posts/`;

          renderPosts({
            apiUrl: url,
            containerSelector: ".posts",
            page: 1,
            title: `${data.username}'s Posts`,
            pushState: true,
            stateObj: { page: "profile_posts", username: data.username },
            urlPath: `/profile/${data.username}/posts`,
          });
        });
      }
      // Followers link
      const followersLink = document.getElementById("followers-link");
      if (followersLink) {
        followersLink.addEventListener("click", function () {
          showFollowers(data.username);
        });
      }

      // Following link
      const followingLink = document.getElementById("following-link");
      if (followingLink) {
        followingLink.addEventListener("click", function () {
          showFollowing(data.username);
        });
      }
      const showUserCommentsBtn = document.getElementById("show-user-comments");
      if (showUserCommentsBtn) {
        showUserCommentsBtn.addEventListener("click", function (e) {
          e.preventDefault();
          showUserComments(data.username); // Now this refers to the function!
        });
      }

      const showUserLikesBtn = document.getElementById("show-user-likes");
      if (showUserLikesBtn) {
        showUserLikesBtn.addEventListener("click", function (e) {
          e.preventDefault();
          showUserLikes(data.username);
        });
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}
function handleFollowingClick(page = 1) {
  showOnlySection("following");
  renderPosts({
    apiUrl: "/api/following/",
    containerSelector: ".following",
    page,
    title: "Following's Posts",
    pushState: true,
    stateObj: { page: "following" },
    urlPath: "/following",
  });
}
function getCSRFToken() {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

function renderSinglePost(postId) {
  showOnlySection("posts");
  history.pushState(
    { page: "single_post", postId },
    "post",
    `/posts/${postId}`,
  );

  // Fetch post and comments in parallel
  Promise.all([
    fetch(`/api/posts/${postId}/`, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
    }).then((response) => response.json()),
    fetch(`/api/posts/${postId}/comment/`).then((response) => response.json())
  ]).then(([post, commentData]) => {
    const postsContainer = document.querySelector(".posts");
    const commentsHtml = commentData.comments
      .map(
        (c) => `
      <div class="comment">
        <strong>${c.user}</strong>: ${c.content}
        <span class="comment-date">${c.created_at}</span>
      </div>
    `
      )
      .join("");

    postsContainer.innerHTML = `
      <div class="post-card" data-post-id="${post.id}">
        <div class="post-header">${post.user}</div>
        <div class="post-meta">${post.updated_at}</div>
        <div class="post-content" id="post-content">${post.content}</div>
        <div class="post-footer">
          <span>Likes: <span class="like-count">${post.likes_count}</span></span>
          ${
            post.can_like
              ? `
            <button class="like-btn btn btn-sm ${post.is_liked ? "btn-danger" : "btn-outline-primary"}">
              ${post.is_liked ? "Unlike" : "Like"}
            </button>
          `
              : ""
          }
          ${
            post.can_edit
              ? `
            <button class="edit-btn btn btn-sm btn-warning">Edit</button>
          `
              : ""
          }
        </div>
        <div class="comments-section">
          <h4>Comments</h4>
          <div id="comments-list">${commentsHtml}</div>
          ${
            window.userIsAuthenticated === "true"
              ? `
            <textarea id="new-comment-content" class="form-control" placeholder="Add a comment"></textarea>
            <button id="submit-comment" class="btn btn-primary btn-sm mt-2">Post Comment</button>
          `
              : `<div class="text-muted">Sign in to comment.</div>`
          }
        </div>
      </div>
    `;

    // Like/Unlike handler
    const likeBtn = postsContainer.querySelector(".like-btn");
    if (likeBtn) {
      likeBtn.addEventListener("click", function () {
        if (window.userIsAuthenticated !== "true") {
          alert("You must be signed in to like posts.");
          return;
        }
        fetch(`/api/posts/${post.id}/like/`, {
          method: post.is_liked ? "DELETE" : "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
          },
        })
          .then((response) => response.json())
          .then((data) => {
            postsContainer.querySelector(".like-count").textContent =
              data.likes_count;
            likeBtn.textContent = data.is_liked ? "Unlike" : "Like";
            likeBtn.className = `like-btn btn btn-sm ${data.is_liked ? "btn-danger" : "btn-outline-primary"}`;
            post.is_liked = data.is_liked; // update local state
          });
      });
    }

    // Edit handler
    const editBtn = postsContainer.querySelector(".edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const contentDiv = postsContainer.querySelector("#post-content");
        const oldContent = contentDiv.textContent;
        contentDiv.innerHTML = `<textarea id="edit-content" class="form-control">${oldContent}</textarea>
        <button id="save-edit" class="btn btn-success btn-sm mt-2">Save</button>
        <button id="cancel-edit" class="btn btn-secondary btn-sm mt-2">Cancel</button>`;
        document.getElementById("save-edit").onclick = function () {
          const newContent = document.getElementById("edit-content").value;
          fetch(`/api/posts/${post.id}/`, {
            method: "PUT",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCSRFToken(),
            },
            body: JSON.stringify({ content: newContent }),
          })
            .then((response) => response.json())
            .then((updated) => {
              contentDiv.textContent = updated.content;
            });
        };
        document.getElementById("cancel-edit").onclick = function () {
          contentDiv.textContent = oldContent;
        };
      });
    }

    // Comment submit handler
    if (window.userIsAuthenticated === "true") {
      const submitCommentBtn = document.getElementById("submit-comment");
      if (submitCommentBtn) {
        submitCommentBtn.onclick = function () {
          const content = document.getElementById("new-comment-content").value.trim();
          if (!content) return;
          fetch(`/api/posts/${post.id}/comment/`, {
            method: "POST",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCSRFToken(),
            },
            body: JSON.stringify({ content }),
          })
            .then((response) => response.json())
            .then((newComment) => {
              // Add new comment to the list
              const commentDiv = document.createElement("div");
              commentDiv.className = "comment";
              commentDiv.innerHTML = `<strong>${newComment.user}</strong>: ${newComment.content} <span class="comment-date">${newComment.created_at}</span>`;
              document.getElementById("comments-list").appendChild(commentDiv);
              document.getElementById("new-comment-content").value = "";
            });
        };
      }
    }
  });
}

function showFollowers(username) {
  //push history state for followers
  history.pushState(
    { page: "followers", username },
    `${username}'s Followers`,
    `/profile/${username}/followers`,
  );
  // Show followers section
  showOnlySection("followers");
  fetch(`/api/profile/${username}/`, {
    method: "GET",
    credentials: "same-origin",
  })
    .then((response) => response.json())
    .then((data) => {
      document.querySelector(".followers").innerHTML = `
      <h2>${username}'s Followers</h2>
      <ul>
        ${data.followers_list.map((u) => `<li><a href="#" class="user-link" data-username="${u}">${u}</a></li>`).join("")}      </ul>
    `;
      document.querySelectorAll(".followers .user-link").forEach((link) => {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          renderProfile(this.dataset.username);
        });
      });
    });
}

function showFollowing(username) {
  //push history state for following
  history.pushState(
    { page: "following", username },
    `${username} is Following`,
    `/profile/${username}/following`,
  );
  showOnlySection("following");
  fetch(`/api/profile/${username}/`, {
    method: "GET",
    credentials: "same-origin",
  })
    .then((response) => response.json())
    .then((data) => {
      document.querySelector(".following").innerHTML = `
      <h2>${username} is Following</h2>
      <ul>
        ${data.following_list.map((u) => `<li><a href="#" class="user-link" data-username="${u}">${u}</a></li>`).join("")}      </ul>
      </ul>
    `;
      document.querySelectorAll(".following .user-link").forEach((link) => {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          renderProfile(this.dataset.username);
        });
      });
    });
}

function showUserComments(username) {
  showOnlySection("posts");
  history.pushState(
    { page: "comments", username },
    `${username}'s Comments`,
    `/profile/${username}/comments`,
  );
  fetch(`/api/profile/${username}/comments/`)
    .then((response) => response.json())
    .then((data) => {
      document.querySelector(".posts").innerHTML = `
        <h2>${username}'s Comments</h2>
        <ul>
          ${data.comments
            .map(
              (c) => `
                <li>
                  <strong>${c.user}</strong> 
                  <a href="#" class="post-link" data-post-id="${c.post}">
                    ${c.content}
                  </a>
                  <br>
                  "${c.content}"
                </li>
              `
            )
            .join("")}
        </ul>
      `;
      // Add event listeners to post links
      document.querySelectorAll(".post-link").forEach(link => {
        link.addEventListener("click", function(e) {
          e.preventDefault();
          renderSinglePost(this.dataset.postId);
        });
      });
    });
}
function showUserLikes(username) {
  showOnlySection("posts");
  history.pushState(
    { page: "likes", username },
    `${username}'s Likes`,
    `/profile/${username}/likes`,
  );
  fetch(`/api/profile/${username}/likes/`)
    .then((response) => response.json())
    .then((data) => {
      document.querySelector(".posts").innerHTML = `
        <h2>${username}'s Likes</h2>
        <ul>
          ${data.likes
            .map(
              (like) => `
                <li>
                  Liked post by <strong>${like.user}</strong>:
                  <a href="#" class="post-link" data-post-id="${like.post_id}">
                    ${like.post_content}
                  </a>
                </li>
              `
            )
            .join("")}
        </ul>
      `;
      // Add event listeners to post links
      document.querySelectorAll(".post-link").forEach(link => {
        link.addEventListener("click", function(e) {
          e.preventDefault();
          renderSinglePost(this.dataset.postId);
        });
      });
    });
}