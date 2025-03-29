const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Ensure this line is correct
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register Route
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body; 
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, role: role || 'user' }); 
        await user.save();

        res.status(201).json({ message: `${role === 'seller' ? 'Seller' : 'User'} registered successfully.` });
    } catch (err) {
        console.error('Error during registration:', err); 
        res.status(500).json({ error: 'An error occurred during registration.' });
    }
});


router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, name: user.username, role: user.role });
    } catch (err) {
        next(err);
    }
});

// Logout Route
router.post('/logout', (req, res) => {
    // Invalidate the token or clear the client-side token
    res.status(200).json({ message: 'User logged out successfully.' });
});

module.exports = router;
