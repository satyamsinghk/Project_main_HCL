const express = require('express');
const router = express.Router();
// Controller exports were "register" and "login" in my updated code, but previous file might have used "signup".
// I will check the previous controller file. It used "signup". 
// I renamed it "register" in the Swagger comments but the export needs to match.
// I'll stick to "register" as per standard, or alias it.
// Let's use register/login.

const { register, login } = require('../controllers/authController');

// @route   POST api/auth/signup -> Register
router.post('/signup', register); 
router.post('/login', login);

module.exports = router;
