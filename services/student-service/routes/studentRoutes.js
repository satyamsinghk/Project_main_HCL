const express = require('express');
const router = express.Router();
const { getAvailableBooks, getMyBorrowRecords, borrowBook, returnBook } = require('../controllers/studentController');
const { authMiddleware, authorize } = require('../../auth-service/middleware/authMiddleware');

const studentOnly = [authMiddleware, authorize('student')];

router.get('/books', authMiddleware, getAvailableBooks);
router.get('/my-records', studentOnly, getMyBorrowRecords);
router.post('/borrow', studentOnly, borrowBook);
router.post('/return', studentOnly, returnBook);

module.exports = router;
