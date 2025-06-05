const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const secretKey = 'your_secret_key'; // Use env vars in production

app.use(express.json());
app.use(express.static(path.join(__dirname, '.'))); // Serves HTML, CSS, JS

// In-memory database
let posts = [
  // ... your original posts array here
];

const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    password: bcrypt.hashSync('user123', 10),
    role: 'user'
  }
];

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey, { expiresIn: '1h' });
  res.json({ token });
});

app.get('/posts', (req, res) => res.json(posts));

app.get('/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

app.post('/posts', authenticateToken, isAdmin, (req, res) => {
  const newPost = {
    id: Date.now(),
    title: req.body.title,
    content: req.body.content,
    author: req.user.username,
    timestamp: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
    comments: []
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

app.put('/posts/:id', authenticateToken, isAdmin, (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.title = req.body.title || post.title;
  post.content = req.body.content || post.content;
  res.json(post);
});

app.delete('/posts/:id', authenticateToken, isAdmin, (req, res) => {
  const index = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Post not found' });
  posts.splice(index, 1);
  res.status(204).send();
});

app.post('/posts/:id/comments', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const comment = {
    id: Date.now(),
    author: req.body.author || `user_${Math.floor(Math.random() * 10000)}`,
    content: req.body.content,
    timestamp: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0
  };
  post.comments.push(comment);
  res.status(201).json(comment);
});

app.post('/posts/:id/upvote', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.upvotes++;
  res.json({ upvotes: post.upvotes });
});

app.post('/posts/:id/downvote', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.downvotes++;
  res.json({ downvotes: post.downvotes });
});

app.post('/comments/:id/upvote', (req, res) => {
  for (let post of posts) {
    const comment = post.comments.find(c => c.id === parseInt(req.params.id));
    if (comment) {
      comment.upvotes++;
      return res.json({ upvotes: comment.upvotes });
    }
  }
  res.status(404).json({ error: 'Comment not found' });
});

app.post('/comments/:id/downvote', (req, res) => {
  for (let post of posts) {
    const comment = post.comments.find(c => c.id === parseInt(req.params.id));
    if (comment) {
      comment.downvotes++;
      return res.json({ downvotes: comment.downvotes });
    }
  }
  res.status(404).json({ error: 'Comment not found' });
});

app.get('/stats', (req, res) => {
  const totalPosts = posts.length;
  const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
  res.json({ totalPosts, totalComments });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
