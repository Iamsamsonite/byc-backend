const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); // Import the auth middleware
const User = require('../models/user');

// REGISTER route
router.post('/register', async (req, res) => {
  try {
    const { name, emailAddress, password } = req.body;

    // Validate required fields
    if (!name || !emailAddress || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ emailAddress });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new user document
    const newUser = new User({
      name,
      emailAddress,
      password: hashedPassword,
      isAdmin: false, // default role for new user
    });

    await newUser.save();
    console.log('New user _id:', newUser._id); // Debug log

    // Create JWT token payload
    const payload = {
      _id: newUser._id,
      isAdmin: newUser.isAdmin,
    };
    console.log('Payload:', payload); // Debug log

    // Sign the JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('Generated token:', token); // Debug log

    res.status(201).json({
        token,
        user: {
          _id: newUser._id,
          name: newUser.name,
          emailAddress: newUser.emailAddress,
          role: newUser.isAdmin ? 'admin' : 'user', // Include role for consistency
        },
      });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// LOGIN route
router.post('/login', async (req, res) => {
  const { emailAddress, password } = req.body;
  if (!emailAddress || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ emailAddress });
  if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

  const validPassword = await bcryptjs.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ message: 'Invalid email or password.' });

  console.log('User _id:', user._id); // Debug
  console.log('isAdmin:', user.isAdmin); // Debug
  const token = jwt.sign(
    { _id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  console.log('Generated token:', token); // Debug

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      emailAddress: user.emailAddress,
      role: user.isAdmin ? 'admin' : 'user',
    },
  });
});

// GET current user (protected)
router.get('/me', auth, async (req, res) => {
  try {
    // req.user is set by the auth middleware (contains _id and isAdmin)
    const user = await User.findById(req.user._id).select('name emailAddress isAdmin');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      emailAddress: user.emailAddress,
      role: user.isAdmin ? 'admin' : 'user',
    });
  } catch (err) {
    console.error('Error fetching user:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;