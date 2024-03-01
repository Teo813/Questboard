document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password').value;
    if (password !== confirmPassword) {
        // Prevent form submission
        event.preventDefault();
        alert('Passwords do not match.');
      }  
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, email }),
    })
    .then(response => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      window.location.href = '/login.html';
      // Code here to handle success, such as updating the UI or redirecting the user
    })
    .catch((errorResponse) => {
      console.log("In Catch");
      errorResponse.json().then((error) => {
        console.error('Error:', error);
        if (error.status === 'error' && error.message.detail.includes('already exists')) {
          alert('The username or email already exists in the database. Please choose another one.');
        } else {
          alert('An unexpected error occurred. Please try again later.');
        }
      });
    });
  });

  