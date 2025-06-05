const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;
const secretKey = 'your_secret_key'; // Replace with a secure key in production

app.use(express.json());

// In-memory data store (replace with a database like MongoDB in production)
let posts = [
  {
    id: 1,
    title: "Bitcoin Analysis: Bullish Signals Emerging",
    content: "Recent on-chain data shows accumulation by large holders. The Puell Multiple suggests we're in the early stages of a new bull market. Key resistance at $65K needs to be broken for confirmation.\n\nThe current market sentiment is positive, with increasing institutional interest and growing adoption in emerging markets. However, regulatory developments remain a key factor to watch in the coming months.",
    author: "admin",
    timestamp: "2023-06-04T12:00:00Z",
    upvotes: 42,
    downvotes: 3,
    comments: [
      {
        id: 1,
        author: "crypto_trader",
        content: "Interesting analysis. What's your price target for EOY? I'm particularly interested in how the halving event might impact the price trajectory.",
        timestamp: "2023-06-04T13:00:00Z",
        upvotes: 5,
        downvotes: 0
      },
      {
        id: 2,
        author: "market_watcher",
        content: "Don't forget about miner capitulation risk if price drops below $58K. The hash rate has been fluctuating recently, which could indicate some stress in the mining sector.",
        timestamp: "2023-06-04T13:15:00Z",
        upvotes: 3,
        downvotes: 1
      }
    ]
  },
  {
    id: 2,
    title: "Upcoming Tech Earnings Preview",
    content: "Big tech earnings next week. Focus on cloud growth rates and AI monetization. My predictions:\n- MSFT: Likely to beat expectations due to Azure growth\n- META: In-line with projections, focus on Reels monetization\n- GOOGL: Slight miss on ad revenue but strong cloud performance\n- AMZN: AWS growth accelerating, retail margins improving\n\nThe key metrics to watch will be guidance for Q3 and any commentary on AI investments and returns.",
    author: "admin",
    timestamp: "2023-06-04T10:00:00Z",
    upvotes: 28,
    downvotes: 7,
    comments: [
      {
        id: 3,
        author: "investor123",
        content: " Agree on MSFT. Their AI products are seeing strong enterprise adoption. I've heard from several CIOs that they're increasing their Azure budgets specifically for AI workloads.",
        timestamp: "2023-06-04T11:00:00Z",
        upvotes: 8,
        downvotes: 2
      }
    ]
  },
  {
    id: 3,
    title: "The Future of Decentralized Finance",
    content: "DeFi continues to evolve at a rapid pace. We're seeing several key trends emerge:\n1. Real-world asset tokenization gaining traction\n2. Layer 2 solutions dramatically reducing transaction costs\n3. Improved UX bringing DeFi to mainstream users\n4. Regulatory frameworks beginning to take shape\n\nThe next 12 months will be crucial for DeFi adoption. Projects that can balance innovation with compliance will likely emerge as leaders.",
    author: "admin",
    timestamp: "2023-06-03T15:00:00Z",
    upvotes: 56,
    downvotes: 4,
    comments: []
  }
];

// Sample users (replace with a database in production)
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10), // Hashed password
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    password: bcrypt.hashSync('user123', 10), // Hashed password
    role: 'user'
  }
];

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey, { expiresIn: '1h' });
  res.json({ token });
});

// Get all posts
app.get('/posts', (req, res) => {
  res.json(posts);
});

// Get a specific post
app.get('/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// Create a new post (admin only)
app.post('/posts', authenticateToken, isAdmin, (req, res) => {
  const newPost = {
    id: Date.now(),
    title: req.body.title,
    content: req.body.content,
    author: req.user.username, // Set author to authenticated admin's username
    timestamp: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
    comments: []
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// Update a post (admin only)
app.put('/posts/:id', authenticateToken, isAdmin, (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.title = req.body.title || post.title;
  post.content = req.body.content || post.content;
  res.json(post);
});

// Delete a post (admin only)
app.delete('/posts/:id', authenticateToken, isAdmin, (req, res) => {
  const postId = parseInt(req.params.id);
  const index = posts.findIndex(p => p.id === postId);
  if (index === -1) return res.status(404).json({ error: 'Post not found' });
  posts.splice(index, 1);
  res.status(204).send();
});

// Add a comment to a post
app.post('/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const newComment = {
    id: Date.now(),
    author: req.body.author || "user_" + Math.floor(Math.random() * 10000),
    content: req.body.content,
    timestamp: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0
  };
  post.comments.push(newComment);
  res.status(201).json(newComment);
});

// Upvote a post
app.post('/posts/:id/upvote', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.upvotes++;
  res.json({ upvotes: post.upvotes });
});

// Downvote a post
app.post('/posts/:id/downvote', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.downvotes++;
  res.json({ downvotes: post.downvotes });
});

// Upvote a comment
app.post('/comments/:id/upvote', (req, res) => {
  const commentId = parseInt(req.params.id);
  let found = false;
  for (let post of posts) {
    const comment = post.comments.find(c => c.id === commentId);
    if (comment) {
      comment.upvotes++;
      found = true;
      res.json({ upvotes: comment.upvotes });
      break;
    }
  }
  if (!found) res.status(404).json({ error: 'Comment not found' });
});

// Downvote a comment
app.post('/comments/:id/downvote', (req, res) => {
  const commentId = parseInt(req.params.id);
  let found = false;
  for (let post of posts) {
    const comment = post.comments.find(c => c.id === commentId);
    if (comment) {
      comment.downvotes++;
      found = true;
      res.json({ downvotes: comment.downvotes });
      break;
    }
  }
  if (!found) res.status(404).json({ error: 'Comment not found' });
});

// Get community stats
app.get('/stats', (req, res) => {
  const totalPosts = posts.length;
  let totalComments = 0;
  posts.forEach(post => {
    totalComments += post.comments.length;
  });
  res.json({ totalPosts, totalComments });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});