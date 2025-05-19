 // C:/Users/HP/Desktop/desktop/bycbackend/routes/user.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

console.log('User model in user.js:', User);

// Register a new user
router.post('/register', async (req, res) => {
  try {
    console.log('Register attempt:', req.body);
    const { name, emailAddress, password, role } = req.body;

    // Validate input
    if (!name || !emailAddress || !password) {
      console.error('Missing required fields:', req.body);
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      console.error('Invalid email format:', emailAddress);
      return res.status(400).json({ message: 'Invalid email address' });
    }
    if (password.length < 6) {
      console.error('Password too short:', password);
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (role && !['user', 'admin'].includes(role)) {
      console.error('Invalid role:', role);
      return res.status(400).json({ message: 'Role must be "user" or "admin"' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ emailAddress });
    if (existingUser) {
      console.error('Email already exists:', emailAddress);
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      emailAddress,
      password: hashedPassword,
      role: role || 'user',
    });
    await user.save();

    console.log('User registered successfully:', emailAddress);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      emailAddress: user.emailAddress,
      role: user.role,
    });
  } catch (err) {
    console.error('Register error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { emailAddress, password } = req.body;

    if (!emailAddress || !password) {
      console.error('Missing email or password:', req.body);
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ emailAddress });
    if (!user) {
      console.error('User not found:', emailAddress);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Password mismatch for:', emailAddress);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    console.log('Login successful for:', emailAddress);
    res.json({
      token,
      user: { id: user._id, name: user.name, emailAddress: user.emailAddress, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;