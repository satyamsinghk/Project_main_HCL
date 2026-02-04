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

    const userRole = role || 'student';
    
    // Admins are auto-approved (or maybe not? Assuming admins are special)
    // Students require approval (default false)
    const isApproved = userRole === 'admin' ? true : false; 

    user = new User({
      name,
      email,
      password,
      role: userRole,
      isApproved
    });

    await user.save();

    res.status(201).json({
      message: 'Registration successful. Please wait for Admin approval to login.',
      // No token returned for students as they can't login yet
      // If admin, maybe we give token? consistent behavior is better: login separately.
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
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'student' && !user.isApproved) {
        return res.status(403).json({ message: 'Account not approved yet. Please contact Admin.' });
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
