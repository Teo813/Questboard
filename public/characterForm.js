document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('characterForm');
    form.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const formData = new FormData(form);
      fetch('/create-character', {
        method: 'POST',
        headers: {
        },
        body: formData,
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        // Redirect or update UI as needed
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred, please try again.');
      });
    });
  });
  