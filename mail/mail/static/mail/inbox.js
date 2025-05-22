document.addEventListener('DOMContentLoaded', function() {
  //console.log("Did we reach here?");  
  document.querySelector('#inbox').addEventListener('click', function(){
    history.pushState({page: 'inbox'}, 'inbox', '/emails/inbox'); 
    load_mailbox('inbox');
});
  document.querySelector('#compose').addEventListener('click', function(){
    history.pushState({page: 'compose'}, 'compose', '/emails/compose'); 
    compose_email();  
  }
  );
  
  document.querySelector('#sent').addEventListener('click', function(){
    history.pushState({page: 'sent'}, 'sent', '/emails/sent');
    load_mailbox('sent');
  }
  );
  document.querySelector('#archived').addEventListener('click', function(){
    history.pushState({page: 'archive'}, 'archive', '/emails/archive');
    load_mailbox('archive');
  }
  );
  document.querySelector('#submit').addEventListener('click', function(event) {
      console.log("Sending email...");

    event.preventDefault();  // prevent page reload
    send_email();
  });
  
  // By default, load the inbox
  history.pushState({page: 'inbox'}, 'inbox', '/emails/inbox');  // Push the inbox state to the history stack
  load_mailbox('inbox');
}
);
let currentMailbox = 'inbox'; // Initialize a variable to store the current mailbox
// Handle back/forward navigation
// This function is called when the user navigates back or forward in the browser
// It checks the state of the history and loads the appropriate mailbox or email
// It uses the onpopstate event to listen for changes in the history state
window.onpopstate = function(event) {
  if (event.state) {
    const page = event.state.page;
    if (page === 'inbox') {
      load_mailbox('inbox');
    } else if (page === 'sent') {
      load_mailbox('sent');
    } else if (page === 'archive') {
      load_mailbox('archive');
    } else if (page === 'compose') {
      compose_email();
    } else if (page === 'email' && event.state.email_id) {
      view_email(event.state.email_id);
    }else {
      // Handle other cases if needed
      console.log("Unknown page state:", page);
    }
  }
};

// Function to navigate to a different page
// I added this function to handle the history state
// It takes the page name, title, url, and extra state as parameters
// It checks if the current state is different from the new state
// If it is, it pushes the new state to the history stack



// compose_email function
// This function is called when the user clicks the compose button
// It shows the compose view and hides the other views
// It also clears out the composition fields
function compose_email() {
  // Update the history state to include the compose view
  //navigate('compose', 'compose', '/emails/compose');
    // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

let counter = 0; // Initialize a counter variable
const quantity = 6; // Set the quantity of emails to fetch
let allEmails = []; // Initialize an array to store all emails
let loading = false; // Initialize a loading variable to track if emails are being loaded

//load_mailbox function
// This function is called when the user clicks on a mailbox (inbox, sent, or archive)
// It retrieves the emails from the server and displays them in the mailbox view
function load_mailbox(mailbox) {
  //navigate(mailbox, mailbox, `/emails/${mailbox}`); // Update the history state to include the mailbox name
  // Show the mailbox view and hide other views
  counter = 0; // Reset the counter to 0
  loading = false; // Set loading to false
  allEmails = []; // Reset the allEmails array
  
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  currentMailbox = mailbox;
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // Fetch the emails from the server
  fetch(`/api/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Iterate over the emails and display them
      if (emails.length === 0) { // Check if the mailbox is empty
        // Create a div to show that the mailbox is empty
        const no_emails = document.createElement('div');
        no_emails.innerHTML = `<p>Your ${mailbox} is empty!!.</p>`;
        no_emails.className = 'no-emails';
        document.querySelector('#emails-view').append(no_emails);
      }else {
        // Create a div to show the emails
        allEmails = emails; // Store all emails in the global variable
        load();
     };
    });
}
function load() {
 // console.log("Loading emails...");
  //console.log("Counter: ", counter);
  // Check if all emails have been loaded
  if (counter >= allEmails.length) {
    loading = false; // Set loading to false
    return; // Exit the function
  }
  // Get the emails div
  const emails_div = document.querySelector('#emails_div');   
  // Iterate over the emails and display them
  for (let i = counter; i < counter + quantity && i < allEmails.length; i++) {
    const email = allEmails[i];
    const email_div = document.createElement('div');
    email_div.className = 'email';
    email_div.id = email.id;
    email_div.style.cursor = 'pointer'; // Change the cursor to pointer
    email_div.style.padding = '10px'; // Add some padding to the div  
    email_div.style.marginBottom = '10px'; // Add some margin to the bottom of the div
    email_div.style.border = '1px solid #ccc'; // Add a border to the div   
    email_div.style.borderRadius = '5px'; // Add rounded corners to the div 
    email_div.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'; // Add a shadow to the div
    email_div.innerHTML = `
          <strong>${email.sender}</strong>
          <p>${email.subject}</p>
          <p>${email.timestamp}</p>
        `;
    email_div.style.backgroundColor = email.read ? 'gray' : 'white';  // Change background color based on read status
        // Add event listener to view the email when clicked
    email_div.addEventListener('click', () => view_email(email.id,currentMailbox));
        
        // Append the email element to the mailbox view
        document.querySelector('#emails-view').append(email_div);
  }
  // Update the counter
  counter += quantity;
  loading = false; // Set loading to false
}


window.onscroll=() => {
  // Check if the user has scrolled to the bottom of the emails view
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight && !loading) {
    // If the user has scrolled to the bottom, load more emails
    loading = true;
    load(); // Load more emails when scrolled to the bottom
  }
}





// Send email function
// This function is called when the user clicks the send button in the compose view
// It retrieves the values from the compose form and sends them to the server
// using the fetch API
function send_email() {
  // Get the values from the compose form

  
  const recipients = document.querySelector('#compose-recipients').value;  // according to the HTML structure
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  // Send the email using fetch
  fetch('/api/emails', {
    method: 'POST',
     headers: {
      'Content-Type': 'application/json'  // Tell server we send JSON
    },
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
      read: false  // Set read status to false when sending
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result.error) {
      alert("Error sending email: " + result.error);
    } else {
      load_mailbox('sent'); // Move only if sending was successful
    }
  });
  
}



// View email function
// This function is called when the user clicks on an email in the mailbox view
// It retrieves the email details from the server and displays them in the email content view
// It also marks the email as read and adds buttons for archiving, replying, deleting, and marking as unread
// It uses the fetch API to get the email details and update the email status
// It also uses the navigate function to update the history state
// It takes the email ID and mailbox name as parameters
function view_email(email_id,mailbox) {
  // Update the history state to include the email ID
  //navigate('email', 'email', `/emails/${email_id}`, { email_id });
  // Show the email content and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // Fetch the email details from the server
  fetch(`/api/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      // Show the email details in the mailbox view
      document.querySelector('#email-content').innerHTML = `
        <h3>${email.subject}</h3>
        <p><strong>From:</strong> ${email.sender}</p>
        <p><strong>To:</strong> ${email.recipients.join(', ')}</p>
        <p><strong>Timestamp:</strong> ${email.timestamp}</p>
        <hr>
        <p>${email.body}</p>
      `;
      // Mark the email as read
      fetch(`/api/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      });
      // Add archive/unarchive button
      //chech if mailbox is not sent
      if (mailbox !== 'sent') {
      const archive_button = document.createElement('button');
      archive_button.innerHTML = email.archived ? 'Unarchive' : 'Archive';
      archive_button.className = 'archive btn btn-sm btn-outline-secondary';
      archive_button.addEventListener('click', () => {
        fetch(`/api/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        })
        .then(() =>   load_mailbox('inbox'));  // Reload the mailbox after archiving/unarchiving
      });
      document.querySelector('#email-content').append(archive_button);
    
      // Add reply button
      const reply_button = document.createElement('button');
      reply_button.innerHTML = 'Reply';
      reply_button.className = 'reply btn btn-sm btn-outline-secondary';
      reply_button.addEventListener('click', () => {
        compose_email();
        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-subject').value = email.subject.startsWith('Re:') ? email.subject : 'Re: ' + email.subject;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
      });
      document.querySelector('#email-content').append(reply_button);
     
      // Add mark as unread button
      const unread_button = document.createElement('button');
      unread_button.innerHTML = email.read ? 'Mark as Unread' : 'Mark as Read';
      unread_button.className = 'unread btn btn-sm btn-outline-secondary';
      unread_button.addEventListener('click', () => {
        fetch(`/api/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: !email.read
          })
        })
        .then(() => load_mailbox(mailbox));  // Reload the mailbox after marking as unread/read
      });
      document.querySelector('#email-content').append(unread_button);
      
    }
    });
}