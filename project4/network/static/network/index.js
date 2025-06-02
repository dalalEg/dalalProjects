document.addEventListener('DOMContentLoaded', function() {
  const profileLink = document.querySelector('#profile_link');
  if (profileLink) {
    
    profileLink.addEventListener('click', function(){
      handleProfileClick();
    });
  }

  const allPostLink = document.querySelector('#all_post_link');
  if (allPostLink) {
    allPostLink.addEventListener('click', function(event){
      event.preventDefault();
      handleAllPostsClick();
    });
  }

  const followingLink = document.querySelector('#following_link');
  if (followingLink) {
    followingLink.addEventListener('click', function(){
      handleFollowingClick();
    });
  }

  const addLink = document.querySelector('#add_link');
  if (addLink) {
    addLink.addEventListener('click', function(){
      handleAddPostClick();
    });
  }

  const postSubmit = document.querySelector('#post_submit');
  if (postSubmit) {
    postSubmit.addEventListener('click', function(){
      handleSubmitPost();
    });
  }

  // Only push state and show profile if authenticated
  if (profileLink) {
    history.pushState({page: 'profile'}, 'profile', '/profile');
    handleProfileClick();
  }
});
window.onpopstate = function(event) {
  // Handle the back/forward navigation
  const currentURL = window.location.pathname;
  if (event.state) {
    console.log("Navigating to:", currentURL);
    if (currentURL.includes('/profile/')) {
      handleProfileClick();
    } else if (currentURL === '/add_post') {
      showOnlySection('NewPost');
    } else if (currentURL === '/posts'|| currentURL === '/') {
        handleAllPostsClick();
    } else if (currentURL === '/following') {
      handleFollowingClick();
    } else if (currentURL === '/followers') {
      showOnlySection('followers');
    }

}}
// Function to show only the specified section and hide others
function showOnlySection(sectionId) {
  const sections = ['profile', 'NewPost', 'posts', 'following', 'followers'];
  sections.forEach(id => {
    const el = document.querySelector(`.${id}`);
    if (el) {
     
        el.style.display = (id === sectionId) ? 'block' : 'none';
      
    }
  });
}


// Function to handle the click event for the profile link
function handleProfileClick() {
    showOnlySection('profile');
 
    //console.log("Profile link clicked, navigating to profile page.");

    //Fetch the profile data from the server
 
    fetch('/api/profile/')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log("Profile data fetched successfully:", data);
      // Redirect to the profile page with the fetched data
        document.querySelector('.profile').innerHTML = ''; // Clear existing content
        history.pushState({page: 'profile'}, 'profile', '/profile');
        //window.URL = `/profile/${data.username}`;
        // Create and append the profile content
        const profile_content= document.createElement('div');
        profile_content.innerHTML = `
        <h1>${data.username}'s Profile</h1>
        <p>Email: ${data.email}</p>
        <p>Followers: ${data.followers}</p>
        <p>Following: ${data.following}</p>
        <h3>Posts:</h3>
        <ul>
            ${data.posts.map(post => `<li>${post.content} (${post.timestamp})</li>`).join('')}
        </ul>
        <h3>All Usernames:</h3>
        <ul>
            ${data.all_users.map(username => `<li>${username}</li>`).join('')}  
        `;
          document.querySelector('.profile').append(profile_content);
    
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

// Function to handle the click event for the add post link
function handleAddPostClick() {
    showOnlySection('NewPost');
    history.pushState({page: 'add_post'}, 'add_post', '/posts');
    // Update the URL to reflect the add post page
}

function handleSubmitPost() {



  const postContent = document.querySelector('#post_content').value;
  if (postContent.trim() === '') {
    alert('Post content cannot be empty.');
    return;
  }

  // Send the post content to the server
  fetch('/api/posts/', {
    method: 'POST',
        credentials: 'same-origin',

    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({content: postContent})
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log("Post submitted successfully:", data);
    // Optionally, redirect to the posts page or update the UI
    handleAllPostsClick();
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}









// Function to handle the click event for the all posts link
function handleAllPostsClick() {
  showOnlySection('posts');
  const loginForm = document.querySelector('#login_form');
  if (loginForm) {
    console.log("Login form exists, hiding it.");
    loginForm.style.display = 'none'; // Hide the login form if it exists
  }
  console.log("All posts link clicked, navigating to all posts page.");
    // Fetch all posts from the server
    fetch('/api/posts/')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log("All posts fetched successfully:", data);
      // Redirect to the all posts page with the fetched data

      history.pushState({page: 'posts'}, 'posts', '/posts');
      // Create and append the posts content
      const posts_content = document.createElement('div');
      posts_content.innerHTML = `
        <h1>All Posts</h1>
        <ul>
            ${data.posts.map(post => `<li>${post.content} (${post.timestamp})</li>`).join('')}
        </ul>
      `;
      const postsContainer = document.querySelector('.posts');
if (postsContainer) {
  postsContainer.innerHTML = ''; // Clear previous content if needed
  postsContainer.append(posts_content);
}
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
    
 
}
// Function to handle the click event for the following link
function handleFollowingClick() {
  showOnlySection('following');
  console.log("Following link clicked, navigating to following page.");
    window.history.pushState({}, '', `/following`);
    // Update the URL to reflect the following page 

    window.URL = `/following`;
}