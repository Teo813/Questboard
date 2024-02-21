document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const username = document.getElementById('username').value;
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
      body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      // You can add code here to handle success, such as updating the UI or redirecting the user
    })
    .catch((error) => {
      console.error('Error:', error);
      // Handle errors here, such as displaying an error message to the user
    });
  });
  