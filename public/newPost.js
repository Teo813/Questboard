document.addEventListener('DOMContentLoaded', function() {
    fetchCharactersForCurrentUser();

function fetchCharactersForCurrentUser() {
console.log("fetchCharacters Frontend function called")
fetch('/get-user-characters') // This endpoint should determine the user based on session or auth token
.then(response => response.json())
.then(characters => {
  const selectElement = document.getElementById('character');
  characters.forEach(character => {
    const option = document.createElement('option');
    option.value = character.characterid;
    option.textContent = character.charactername;
    selectElement.appendChild(option);
  });
})
.catch(error => console.error('Error fetching characters:', error));
}
  // Handle form submission
  const form = document.getElementById('postForm');
  form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
  
    const formData = new FormData(form);
    fetch('/submit-post', {
      method: 'POST',
      body: formData, // Send formData object directly
      credentials: 'include' // Include cookies in the request
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      alert(data.message); // Consider a more user-friendly approach
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('An error occurred, please try again.');
    });
  });
  
});