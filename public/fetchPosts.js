async function fetchPosts() {
    const response = await fetch('/posts');
    const posts = await response.json();

    const postsContainer = document.getElementById('posts');
    posts.forEach(post => {
const postElement = document.createElement('div');
postElement.classList.add('post-container'); // Add the container class

let imageHTML = '';
if (post.image_url) { // Check if there's an image URL
  imageHTML = `<img src="${post.image_url}" alt="Post Image" class="post-image">`;
}
postElement.innerHTML = `
<div class="tweet-header">
  <img src="${post.characterimageurl}" alt="${post.charactername}'s profile picture" class="tweet-profile-picture">
  <h2 class="tweet-username">${post.charactername}</h2>
  <small class="tweet-time">Posted at: ${new Date(post.createdat).toLocaleString()}</small>
</div>
<p class="tweet-text">${post.text}</p>
${imageHTML} <!-- Image is rendered here if available -->
<p class="tweet-tags">Tags: ${post.tags}</p>
`;



postsContainer.appendChild(postElement);
});

  }

  fetchPosts();