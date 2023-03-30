document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', sendMail);

  load_mailbox('inbox');
});

function sendMail(event) {
  event.preventDefault();
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
      load_mailbox('sent');
  });
};



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
  
      emails.forEach(email => {
        let emailContainer = document.createElement('div');
        document.querySelector('#emails-view').append(emailContainer);
        emailContainer.style.border = '1px solid black';
        emailContainer.style.marginBottom = '10px';
        emailContainer.style.cursor = 'pointer';
        emailContainer.style.display = 'block';
        emailContainer.classList.add("smallE");

        let eSubject = document.createElement('div');
        let eSender = document.createElement('div');
        let eTime = document.createElement('div');
        emailContainer.appendChild(eSubject);
        emailContainer.appendChild(eSender);
        emailContainer.appendChild(eTime);
        if (email.read == true) {
          emailContainer.style.backgroundColor = 'grey';
        } else {
          emailContainer.style.backgroundColor = 'white';
        }

        if (mailbox == 'inbox') {
          eSender.innerHTML = 'Sent by: ' + email.sender;
          eSubject.innerHTML = 'Subject: ' + email.subject;
          eTime.innerHTML = 'Timestamp: ' + email.timestamp;
          archivebtn = document.createElement('button');
          emailContainer.appendChild(archivebtn);
          archivebtn.innerHTML = 'Archive';
          archivebtn.classList.add('btn');
          archivebtn.classList.add('btn-primary');
          archivebtn.style.zIndex = '2';
          archivebtn.addEventListener('click', (event) => {
            
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: true
              })
            })
            .then(response => {
              load_mailbox('inbox')
            });
            event.stopPropagation();
          })

        } else if (mailbox == 'sent') {
          eSender.innerHTML = 'Sent to: ' + email.recipients;
          eSubject.innerHTML = 'Subject: ' + email.subject;
          eTime.innerHTML = 'Timestamp: ' + email.timestamp;

        } else if (mailbox == 'archive') {
          eSender.innerHTML = 'Sent by: ' + email.sender;
          eSubject.innerHTML = 'Subject: ' + email.subject;
          eTime.innerHTML = 'Timestamp: ' + email.timestamp;

          archivebtn = document.createElement('button');
          emailContainer.appendChild(archivebtn);
          archivebtn.innerHTML = 'Un-Archive';
          archivebtn.classList.add('btn');
          archivebtn.classList.add('btn-primary');
          archivebtn.style.zIndex = '2';
          archivebtn.addEventListener('click', (event) => {
          
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
              })
            })
            .then(response => {
              load_mailbox('inbox')
            });
            event.stopPropagation();
          })

        }

        emailContainer.addEventListener('click', () => {
          fetch(`/emails/${email.id}`)
          .then(response => response.json())
          .then(email => {
              // Print email
              console.log(email);
              document.querySelectorAll('.smallE').forEach(element => element.style.display = 'none');
              let largeEmail = document.createElement('div');
              document.querySelector('#emails-view').append(largeEmail);
              largeEmail.style.height = '50vh';
              largeEmail.style.width = '80%';
              largeEmail.style.border = '2px solid black';
              largeEmail.appendChild(eSubject);
              largeEmail.appendChild(eSender);
              largeEmail.appendChild(eTime);
              let eBody = document.createElement('div');
              eBody.innerHTML = 'Body: ' + email.body;
              largeEmail.appendChild(eBody);

              let reply = document.createElement('button');
              reply.innerHTML = 'Reply';
              reply.classList.add('btn');
              reply.classList.add('btn-primary');
              largeEmail.appendChild(reply);


              fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    read: true
                })
              })
              // ... do something else with email ...
              reply.addEventListener('click', () => {
                compose_email(email);
                document.querySelector('#compose-recipients').value = email.sender;
                document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
                document.querySelector('#compose-body').value = 'On ' + email.timestamp + ' ' + email.sender + ' wrote: ';
                console.log(email);

              })

          });
        })
      })

      
      
  });
}