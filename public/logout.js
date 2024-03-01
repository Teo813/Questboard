document.getElementById('logoutButton').addEventListener('click', function() {
    fetch('/logout', { method: 'POST' }) // Using POST method for logout
      .then(response => {
        if (response.ok) {
          // Redirect to the home page or login page upon successful logout
          window.location.href = '/';
        }
      })
      .catch(error => console.error('Logout failed:', error));
  });
  