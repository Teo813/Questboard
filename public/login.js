document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    .then(response => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then(data => {
      console.log('Login Success:', data);
      window.location.href = '/index.html'; // Redirect to dashboard or home page on successful login
    })
    .catch((errorResponse) => {
      console.log("In Catch");
      errorResponse.json().then((error) => {
        console.error('Login Error:', error);
        alert('Failed to login. Please check your username and password.');
      });
    });
  });