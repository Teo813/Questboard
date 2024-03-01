document.addEventListener('DOMContentLoaded', async function() {
    await checkSessionAndUpdateUI();
    // Other initialization code...
  });
  
  async function checkSessionAndUpdateUI() {
    try {
      const response = await fetch('/check-session'); // Endpoint to check session
      const data = await response.json();
  
      const userAuthContainer = document.getElementById('user-auth-placeholder');
  
      if (data.isLoggedIn) {
        // User is logged in
        userAuthContainer.innerHTML = `
          <div class="user-profile">
            <img src="" alt="Profile Picture">
            <span>${data.username}</span>
            <div class="dropdown-menu">
              <a href="/account-info" style="text-decoration: none; color: black; cursor: pointer;">Account Info</a>
              <a href="#" id="logoutButton" style="text-decoration: none; color: black; cursor: pointer;">Logout</a>
            </div>
          </div>
        `;
  
        document.getElementById('logoutButton').addEventListener('click', logoutUser);
      } else {
        // User is not logged in
        userAuthContainer.innerHTML = '<a href="/login.html" style="text-decoration: none; color: black; cursor: pointer;">Login</a>';
      }
    } catch (error) {
      console.error('Failed to check session status:', error);
    }
  }
  
  async function logoutUser() {
    try {
      const response = await fetch('/logout', { method: 'POST' });
      if (response.ok) {
        // Successfully logged out, update UI
        await checkSessionAndUpdateUI();
        // Reload the current page
        location.reload();
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }