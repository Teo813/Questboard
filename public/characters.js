document.addEventListener("DOMContentLoaded", function() {
    fetch('/get-user-characters-full', { // Make sure this matches your actual endpoint
        method: 'GET',
        credentials: 'include' // Ensure cookies are sent with the request
    })
    .then(response => response.json())
    .then(characters => {
        const container = document.getElementById('characterContainer');
        characters.forEach(character => {
            const card = document.createElement('div');
            // Add card styling classes here if using a framework like Bootstrap
            card.innerHTML = `
                <img src="${character.characterimageurl || '/profilePics/default-image.jpg'}" alt="Character Image">
                <h3>${character.charactername}</h3>
                <p>${character.characterdescription}</p>
                <button onclick="openEditModal('${character.characterid}', '${character.charactername}', '${character.characterdescription}')">Edit</button>
                <button onclick="deleteCharacter('${character.characterid}')">Delete</button>
            `;
            container.appendChild(card);
        });
    })
    .catch(error => console.error('Error fetching characters:', error));
});

function editCharacter(characterId) {
    // Redirect to an edit page or open an edit modal
    window.location.href = `/edit-character.html?characterId=${characterId}`;
}

function openEditModal(characterId, characterName, characterDescription) {
    document.getElementById('editCharacterModal').style.display = 'flex';
    document.getElementById('editCharacterId').value = characterId;
    document.getElementById('editCharacterName').value = characterName;
    document.getElementById('editCharacterDescription').value = characterDescription;
}

function closeEditModal() {
    document.getElementById('editCharacterModal').style.display = 'none';
}

document.getElementById('editCharacterForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const characterId = document.getElementById('editCharacterId').value;
    const formData = new FormData(this);

    fetch(`/update-character/${characterId}`, {
        method: 'PUT',
        body: formData, // Use FormData to send the image and other data
        credentials: 'include', // Include cookies
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            closeEditModal();
            window.location.reload(); // Reload to show the updated character list
        }
    })
    .catch(error => {
        console.error('Error updating character:', error);
        alert('Error updating character');
    });
});



function deleteCharacter(characterId) {
    if (!confirm('Are you sure you want to delete this character?')) {
        return;
    }

    fetch(`/delete-character/${characterId}`, {
        method: 'DELETE',
        credentials: 'include' // Ensure cookies are sent with the request
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Flash message
        window.location.reload(); // Reload the page to reflect the deletion
    })
    .catch(error => {
        console.error('Error deleting character:', error);
        alert('Error deleting character');
    });
}

