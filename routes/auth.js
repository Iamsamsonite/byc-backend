
const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const config = require('config'); // Ensure config is correctly imported
// const auth = require('../middleware/auth'); // Ensure the auth middleware is correctly imported
const User = require('../models/user'); // Ensure the User model is correctly imported


router.post('/login', async (req, res) => {
    const { emailAddress, password } = req.body;

    // Validate input
    if (!emailAddress || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find the user by email address
    const user = await User.findOne({ emailAddress });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    console.log('User found:', user); // Debugging log
    console.log('Is Admin:', user.isAdmin); // Debugging log

    // Compare password
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password.' });

    // Generate token
    const token = jwt.sign(
        { _id: user._id, isAdmin: user.isAdmin }, // Include isAdmin in the payload
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            emailAddress: user.emailAddress,
            role: user.isAdmin ? 'admin' : 'user' // Set role based on isAdmin
        }
    });
});

module.exports = router;