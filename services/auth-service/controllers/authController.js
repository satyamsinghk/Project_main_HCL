const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendResponse = require('../../../utils/responseHandler');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication Management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, admin]
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: User already exists
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
        return sendResponse(res, 409, 'User already exists');
    }

    const userRole = role || 'student';
    // Students require approval (default false), Admins auto-approved (for now/bootstrap)
    // Adjust logic if you want strict admin approval. Assuming admins created here are trustworthy or via secret.
    const isApproved = userRole === 'admin' ? true : false; 

    user = new User({
      name,
      email,
      password,
      role: userRole,
      isApproved
    });

    await user.save();

    sendResponse(res, 201, 'Registration successful. Please wait for Admin approval to login.', {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not approved
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 401, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendResponse(res, 401, 'Invalid credentials');
    }

    if (user.role === 'student' && !user.isApproved) {
        return sendResponse(res, 403, 'Account not approved yet. Please contact Admin.');
    }

    const token = generateToken(user);
    
    sendResponse(res, 200, 'Login successful', {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
  } catch (error) {
    next(error);
  }
};
