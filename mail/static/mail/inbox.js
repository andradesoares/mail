document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#send').addEventListener('click', send_email);
  document.querySelector('#emails-view').addEventListener('click', eventOnElement => {
    if (eventOnElement.target.matches('.emailButton')) {
      load_email(eventOnElement.target.id), read_email(eventOnElement.target.id)
    }
  })
  document.querySelector('#email-view').addEventListener('click', eventOnElement => {
    if (eventOnElement.target.matches('#email-reply')) {
      reply_email(eventOnElement.target.value)
    }
    if (eventOnElement.target.matches('#email-archived')) {
      archive_email(eventOnElement.target.value)
    }
  })
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = ''; 
}

function send_email() {
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`,{
    headers : { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
     }
  })
  .then(response => response.json())
  .then(emails => {
      for (let i of emails){
        document.querySelector('#emails-view').innerHTML +=
          `
          <div class="emails emailButton" style="background-color:${i.read ? "LightGray" : "White"}" id="${i.id}">
            <div class="email ">
                <p class="strong">${i.sender}</p>
                <p>${i.subject}</p>
                <input type="hidden" id="emailArchived${i.id}" name="emailArchived" value="${i.archived}">
              </div>
              <div class="email">
                <p>${i.timestamp}</p>
            </div>
          </div>
          `;
      }
  })
  .catch(error =>{
    console.log(error)
  });
}

function load_email(email_id) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(emails => {
    document.querySelector('#email-view').innerHTML =
      `
      <div class="singleMail">
        <div class="mail">
          <p class="strong">From: </p>
          <p> ${emails.sender}</p>
        </div>
        <div class="mail">
          <p class="strong">To: </p>
          <p> ${emails.recipients[0]}</p>
        </div>
        <div class="mail">
          <p class="strong">Subject: </p>
          <p> ${emails.subject}</p>
        </div>
        <div class="mail">
          <p class="strong">Timestamp: </p>
          <p> ${emails.timestamp}</p>
        </div>
        <div class="mail">
          <button type="button" value="${emails.id}" id="email-archived" class="btn btn-primary btn-sm">${emails.archived ? "Unarchive" : "Archive"}</button>
          <button type="button" value="${emails.id}" id="email-reply" class="btn btn-primary btn-sm">Reply</button>
        </div>
      </div>
      <div>
        <p> ${emails.body}</p>
      </div>
      `
  })
}

function archive_email(email_id) {

  const email_archived = document.querySelector(`#emailArchived${email_id}`).value
  
  let checkEmail
  email_archived == "false" ? checkEmail = true : checkEmail = false;
  
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: checkEmail,
    })
  })
  .then(load_mailbox('inbox'))
  .catch(error =>{
    console.log(error)
  });
}

function read_email(email_id) {

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true,
    })
  })
  .catch(error =>{
    console.log(error)
  });
}

function reply_email(email_id) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(emails => {
    document.querySelector('#compose-recipients').value = emails.sender
    document.querySelector('#compose-subject').value = `Re: ${emails.subject}`
    document.querySelector('#compose-body').value = `On ${emails.timestamp} ${emails.sender} wrote: ${emails.body}`
  })
}

