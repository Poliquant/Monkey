// Mock data for GitHub Pages demo
const mockPosts = [
  {
    _id: '1',
    title: 'Market Analysis: Tech Sector',
    content: 'The tech sector shows strong growth this quarter with AI companies leading the charge.',
    author: 'Admin',
    timestamp: new Date().toISOString(),
    upvotes: 24,
    downvotes: 2,
    comments: [
      {
        _id: 'c1',
        content: 'Great analysis! I agree with your points about AI growth.',
        author: 'User123',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        upvotes: 5,
        downvotes: 0
      }
    ]
  },
  {
    _id: '2',
    title: 'Earnings Report Preview',
    content: 'Upcoming earnings reports to watch this week: AAPL, MSFT, GOOGL.',
    author: 'Admin',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    upvotes: 18,
    downvotes: 1,
    comments: []
  }
];

async function fetchPosts() {
    try {
        // For GitHub Pages demo, we'll use mock data
        // In a real app, you would use a real API endpoint:
        // const response = await fetch('https://your-api.com/posts');
        renderPosts(mockPosts);
    } catch (error) {
        showNotification(error.message, true);
    }
}

function renderPosts(posts) {
    const postsContainer = document.getElementById('posts');
    if (!postsContainer) return;
    
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
            <button class="upvote" data-id="${post._id}"><i class="fas fa-thumbs-up"></i> <span class="vote-count">${post.upvotes}</span></button>
            <button class="downvote" data-id="${post._id}"><i class="fas fa-thumbs-down"></i> <span class="vote-count">${post.downvotes}</span></button>
        </p>
        <div class="comments">
            <h4>Comments (${post.comments.length})</h4>
            ${post.comments.map(comment => `
                <div class="comment">
                    <p>${comment.content} by ${comment.author} on ${new Date(comment.timestamp).toLocaleString()}</p>
                    <p>
                        <button class="upvote" data-id="${comment._id}" data-type="comment"><i class="fas fa-thumbs-up"></i> <span class="vote-count">${comment.upvotes}</span></button>
                        <button class="downvote" data-id="${comment._id}" data-type="comment"><i class="fas fa-thumbs-down"></i> <span class="vote-count">${comment.downvotes}</span></button>
                    </p>
                </div>
            `).join('')}
            <input type="text" placeholder="Add a comment" id="comment-input-${post._id}">
            <button class="add-comment" data-postid="${post._id}"><i class="fas fa-comment"></i> Comment</button>
        </div>
    `;

    // Add event listeners
    postDiv.querySelector('.upvote').addEventListener('click', () => handleVote('upvote', post._id, 'post'));
    postDiv.querySelector('.downvote').addEventListener('click', () => handleVote('downvote', post._id, 'post'));
    postDiv.querySelector('.add-comment').addEventListener('click', () => {
        const postId = postDiv.querySelector('.add-comment').getAttribute('data-postid');
        addComment(postId);
    });

    // Add event listeners for comment votes
    postDiv.querySelectorAll('.comment .upvote').forEach(button => {
        button.addEventListener('click', () => handleVote('upvote', button.dataset.id, 'comment'));
    });
    postDiv.querySelectorAll('.comment .downvote').forEach(button => {
        button.addEventListener('click', () => handleVote('downvote', button.dataset.id, 'comment'));
    });

    return postDiv;
}

function handleVote(type, id, entity) {
    try {
        // For GitHub Pages demo, we'll just update the UI
        // In a real app, you would call your API:
        // const url = entity === 'post' 
        //   ? `https://your-api.com/posts/${id}/${type}`
        //   : `https://your-api.com/comments/${id}/${type}`;
        // await fetch(url, { method: 'POST' });
        
        // Update the mock data (just for UI demo)
        if (entity === 'post') {
            const post = mockPosts.find(p => p._id === id);
            if (post) post[type + 's']++;
        } else {
            for (const post of mockPosts) {
                const comment = post.comments.find(c => c._id === id);
                if (comment) {
                    comment[type + 's']++;
                    break;
                }
            }
        }
        
        // Refresh the display
        renderPosts(mockPosts);
        showNotification(`Vote recorded! (${type} on ${entity})`);
    } catch (error) {
        showNotification(error.message, true);
    }
}

function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    if (!content) {
        showNotification('Please enter a comment', true);
        return;
    }
    
    try {
        // For GitHub Pages demo, we'll just update the mock data
        // In a real app, you would call your API:
        // await fetch(`https://your-api.com/posts/${postId}/comments`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ content, author: 'Anonymous' })
        // });
        
        // Update mock data
        const post = mockPosts.find(p => p._id === postId);
        if (post) {
            post.comments.push({
                _id: 'c' + Date.now(),
                content,
                author: 'You',
                timestamp: new Date().toISOString(),
                upvotes: 0,
                downvotes: 0
            });
        }
        
        input.value = '';
        renderPosts(mockPosts);
        showNotification('Comment added successfully!');
    } catch (error) {
        showNotification(error.message, true);
    }
}

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.style.background = isError ? 'var(--error)' : 'var(--primary)';
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
});
