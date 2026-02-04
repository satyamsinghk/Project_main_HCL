const BorrowRecord = require('../models/Registration');
const Book = require('../models/Book');

/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Student Book Operations
 */

/**
 * @swagger
 * /student/books:
 *   get:
 *     summary: Get available books
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: List of available books }
 */
exports.getAvailableBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find({ availableCopies: { $gt: 0 } })
      .skip(skip)
      .limit(limit);
    
    const total = await Book.countDocuments({ availableCopies: { $gt: 0 } });

    sendResponse(res, 200, 'Available books', {
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /student/borrow:
 *   post:
 *     summary: Borrow a book
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId: { type: string }
 *     responses:
 *       200: { description: Book borrowed }
 */
exports.borrowBook = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book || book.availableCopies < 1) {
      return sendResponse(res, 400, 'Book not available');
    }

    const existingRef = await BorrowRecord.findOne({ userId, bookId, status: 'borrowed' });
    if(existingRef) {
        return sendResponse(res, 400, 'You have already borrowed this book');
    }

    const record = new BorrowRecord({
      userId,
      bookId,
      issueDate: new Date(),
      status: 'borrowed',
      dueAmount: 0 
    });

    await record.save();

    book.availableCopies -= 1;
    await book.save();

    sendResponse(res, 200, 'Book borrowed successfully', record);
  } catch (error) {
    next(error);
  }
};

exports.returnBook = async (req, res, next) => {
    try {
        const { registrationId } = req.body; // or recordId
        // Assuming BorrowRecord model has userId, bookId.
        // Wait, frontend sends { registrationId } ?
        // Previous frontend code: `api.post('/student/return', { registrationId })`.
        // So I need to find by ID.

        // Note: Previous code might have used `userId` + `bookId` or just `_id`. 
        // StudentDashboard passes `record._id` as `registrationId`.
        const record = await BorrowRecord.findById(registrationId);
        
        if (!record) return sendResponse(res, 404, 'Record not found');
        if (record.status === 'returned') return sendResponse(res, 400, 'Already returned');

        record.status = 'returned';
        record.returnDate = new Date();
        await record.save();

        // Update book copies
        const book = await Book.findById(record.bookId);
        if(book) {
            book.availableCopies += 1;
            await book.save();
        }

        sendResponse(res, 200, 'Book returned', record);
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /student/mybooks:
 *   get:
 *     summary: Get my borrowed books
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of my books }
 */
exports.getMyBorrowRecords = async (req, res, next) => {
  try {
    const records = await BorrowRecord.find({ userId: req.user.id })
      .populate('bookId', 'title author');
    sendResponse(res, 200, 'My books', records);
  } catch (error) {
    next(error);
  }
};
