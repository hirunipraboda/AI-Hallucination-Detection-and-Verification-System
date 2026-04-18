const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password, userType: userType || 'other' });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[AUTH] Register error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    // Return specific error message if it helps debugging
    res.status(500).json({ message: 'Server error during registration', detail: error.message });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[AUTH] Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('[AUTH] User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('[AUTH] User found, comparing passwords...');
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('[AUTH] Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('[AUTH] Password match, generating token...');
    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[AUTH] Login error detailed:', error);
    res.status(500).json({ message: 'Server error during login', detail: error.message });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userType: user.userType,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('[AUTH] GetMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('[AUTH] Change password error:', error);
    res.status(500).json({ message: 'Server error during password update' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access to user database' });
    }
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('[AUTH] GetAllUsers error:', error);
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

module.exports = { register, login, getMe, changePassword, getAllUsers };

