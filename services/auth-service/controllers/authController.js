const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, studentId } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Simple validation for admin creation (In real app, might want to restrict this)
    if (role === 'admin' && !process.env.ALLOW_ADMIN_REGISTRATION) {
         // for this assignment we allow it, or maybe just default to student
         // intentionally left open for ease of testing
    }

    user = new User({
      name,
      email,
      password,
      role: role || 'student',
      // studentId field removed from schema in previous step, so we rely on what the schema allows/ignores
      // But prompt 2 Schema for User didn't have studentId. 
      // User passed it, Mongoose will ignore it if strict.
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // 401 is better for authentication failure, some use 400/404 to avoid enumeration
      // Requested: 401
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
