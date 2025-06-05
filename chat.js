async function fetchPosts() {
    try {
        const response = await fetch('/posts');
        if (!response.ok) throw new Error('Failed to fetch posts');
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        showNotification(error.message, true);
    }
}

function renderPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <p>By ${post.author} on ${new Date(post.timestamp).toLocaleString()}</p>
        <p>
            <button class="upvote" data-id="${post._id}"><i class="fas fa-thumbs-up"></i> ${post.upvotes}</button>
            <button class="downvote" data-id="${post._id}"><i class="fas fa-thumbs-down"></i> ${post.downvotes}</button>
        </p>
        <div class="comments">
            <h4>Comments</h4>
            ${post.comments.map(comment => `
                <div class="comment">
                    <p>${comment.content} by ${comment.author} on ${new Date(comment.timestamp).toLocaleString()}</p>
                    <p>
                        <button class="upvote" data-id="${comment._id}" data-type="comment"><i class="fas fa-thumbs-up"></i> ${comment.upvotes}</button>
                        <button class="downvote" data-id="${comment._id}" data-type="comment"><i class="fas fa-thumbs-down"></i> ${comment.downvotes}</button>
                    </p>
                </div>
            `).join('')}
            <input type="text" placeholder="Add a comment" id="comment-input-${post._id}">
            <button onclick="addComment('${post._id}')"><i class="fas fa-comment"></i> Comment</button>
        </div>
    `;

    const upvoteButton = postDiv.querySelector('.upvote');
    const downvoteButton = postDiv.querySelector('.downvote');
    upvoteButton.addEventListener('click', () => handleVote('upvote', post._id, 'post'));
    downvoteButton.addEventListener('click', () => handleVote('downvote', post._id, 'post'));

    const commentUpvoteButtons = postDiv.querySelectorAll('.comment .upvote');
    const commentDownvoteButtons = postDiv.querySelectorAll('.comment .downvote');
    commentUpvoteButtons.forEach(button => {
        button.addEventListener('click', () => handleVote('upvote', button.dataset.id, 'comment'));
    });
    commentDownvoteButtons.forEach(button => {
        button.addEventListener('click', () => handleVote('downvote', button.dataset.id, 'comment'));
    });

    return postDiv;
}

async function handleVote(type, id, entity) {
    try {
        const url = entity === 'post' ? `/posts/${id}/${type}` : `/comments/${id}/${type}`;
        const response = await fetch(url, { method: 'POST' });
        if (!response.ok) throw new Error(`Failed to ${type} ${entity}`);
        fetchPosts();
    } catch (error) {
        showNotification(error.message, true);
    }
}

async function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    if (!content) {
        showNotification('Please enter a comment', true);
        return;
    }
    try {
        const response = await fetch(`/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, author: 'Anonymous' })
        });
        if (!response.ok) throw new Error('Failed to add comment');
        input.value = '';
        fetchPosts();
        showNotification('Comment added successfully!');
    } catch (error) {
        showNotification(error.message, true);
    }
}

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.background = isError ? 'var(--error)' : 'var(--primary)';
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
});