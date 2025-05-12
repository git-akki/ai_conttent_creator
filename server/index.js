import express from 'express';
import jwt from 'jsonwebtoken';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.json());

// Mock data
const users = [
  { id: '1', email: 'demo@example.com', password: 'password123', name: 'Demo User' }
];

const accounts = [
  { id: '1', userId: '1', platform: 'twitter', handle: '@demouser', connected: true },
  { id: '2', userId: '1', platform: 'instagram', handle: '@demouser', connected: true },
  { id: '3', userId: '1', platform: 'facebook', handle: 'Demo User', connected: false },
  { id: '4', userId: '1', platform: 'linkedin', handle: 'Demo User', connected: true }
];

const posts = [
  { 
    id: '1', 
    userId: '1', 
    content: 'Check out our new product launch! #excited', 
    platforms: ['twitter', 'instagram'], 
    scheduled: new Date('2025-05-15T10:00:00'), 
    status: 'scheduled',
    image: 'https://images.pexels.com/photos/7947941/pexels-photo-7947941.jpeg'
  },
  { 
    id: '2', 
    userId: '1', 
    content: 'We\'re hiring! Join our amazing team today.', 
    platforms: ['linkedin', 'twitter'], 
    scheduled: new Date('2025-05-16T14:30:00'), 
    status: 'scheduled',
    image: null
  },
  { 
    id: '3', 
    userId: '1', 
    content: 'Thank you to everyone who attended our webinar!', 
    platforms: ['facebook', 'linkedin'], 
    scheduled: new Date('2025-05-10T09:00:00'), 
    status: 'published',
    image: 'https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg'
  }
];

const analytics = {
  twitter: {
    followers: 2342,
    engagement: 3.8,
    retweets: 124,
    likes: 532,
    daily: [
      { date: '2025-05-01', followers: 2300, engagement: 3.2 },
      { date: '2025-05-02', followers: 2315, engagement: 3.4 },
      { date: '2025-05-03', followers: 2322, engagement: 3.5 },
      { date: '2025-05-04', followers: 2330, engagement: 3.6 },
      { date: '2025-05-05', followers: 2336, engagement: 3.7 },
      { date: '2025-05-06', followers: 2342, engagement: 3.8 }
    ]
  },
  instagram: {
    followers: 5432,
    engagement: 4.2,
    likes: 1243,
    comments: 215,
    daily: [
      { date: '2025-05-01', followers: 5350, engagement: 4.0 },
      { date: '2025-05-02', followers: 5375, engagement: 4.0 },
      { date: '2025-05-03', followers: 5390, engagement: 4.1 },
      { date: '2025-05-04', followers: 5410, engagement: 4.1 },
      { date: '2025-05-05', followers: 5420, engagement: 4.2 },
      { date: '2025-05-06', followers: 5432, engagement: 4.2 }
    ]
  },
  linkedin: {
    followers: 1243,
    engagement: 2.8,
    reactions: 345,
    comments: 87,
    daily: [
      { date: '2025-05-01', followers: 1210, engagement: 2.5 },
      { date: '2025-05-02', followers: 1215, engagement: 2.6 },
      { date: '2025-05-03', followers: 1225, engagement: 2.6 },
      { date: '2025-05-04', followers: 1230, engagement: 2.7 },
      { date: '2025-05-05', followers: 1238, engagement: 2.7 },
      { date: '2025-05-06', followers: 1243, engagement: 2.8 }
    ]
  },
  facebook: {
    followers: 3254,
    engagement: 2.1,
    reactions: 578,
    shares: 124,
    daily: [
      { date: '2025-05-01', followers: 3210, engagement: 1.9 },
      { date: '2025-05-02', followers: 3220, engagement: 1.9 },
      { date: '2025-05-03', followers: 3228, engagement: 2.0 },
      { date: '2025-05-04', followers: 3235, engagement: 2.0 },
      { date: '2025-05-05', followers: 3245, engagement: 2.1 },
      { date: '2025-05-06', followers: 3254, engagement: 2.1 }
    ]
  }
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name }, 
    'secret_key', 
    { expiresIn: '7d' }
  );
  
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Middleware to protect routes
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// User routes
app.get('/api/user', authenticateUser, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  res.json({ id: user.id, email: user.email, name: user.name });
});

// Social accounts routes
app.get('/api/accounts', authenticateUser, (req, res) => {
  const userAccounts = accounts.filter(a => a.userId === req.user.id);
  res.json(userAccounts);
});

// Posts routes
app.get('/api/posts', authenticateUser, (req, res) => {
  const userPosts = posts.filter(p => p.userId === req.user.id);
  res.json(userPosts);
});

app.post('/api/posts', authenticateUser, (req, res) => {
  const { content, platforms, scheduled, image } = req.body;
  
  const newPost = {
    id: String(posts.length + 1),
    userId: req.user.id,
    content,
    platforms,
    scheduled: new Date(scheduled),
    status: 'scheduled',
    image
  };
  
  posts.push(newPost);
  res.status(201).json(newPost);
});

// Analytics routes
app.get('/api/analytics', authenticateUser, (req, res) => {
  res.json(analytics);
});

// API routes should be before the catch-all route
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// In development, let Vite handle all other routes
if (process.env.NODE_ENV === 'development') {
  app.get('*', (req, res) => {
    res.redirect('http://localhost:5173' + req.path);
  });
} else {
  // In production, serve static files and handle client-side routing
  app.use(express.static(join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});