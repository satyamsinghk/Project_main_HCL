const express = require('express');
const router = express.Router();
const { addBook, updateBook, deleteBook, getAllBooks, getAllStudents } = require('../controllers/adminController');
const { authMiddleware, authorize } = require('../../auth-service/middleware/authMiddleware');

// Validating roles
const adminOnly = [authMiddleware, authorize('admin')];

// Book Routes
router.post('/books', adminOnly, addBook);
router.put('/books/:id', adminOnly, updateBook);
router.delete('/books/:id', adminOnly, deleteBook);
router.get('/books', adminOnly, getAllBooks); // Admin view of books

// Student Management Routes
router.get('/students', adminOnly, getAllStudents);

module.exports = router;
