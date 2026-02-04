const Book = require('../../student-service/models/Book');
const User = require('../../auth-service/models/User'); 
const Registration = require('../../student-service/models/Registration');
const sendResponse = require('../../../utils/responseHandler');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin Book & User Management
 */

/**
 * @swagger
 * /admin/books:
 *   post:
 *     summary: Add a new book
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, author, totalCopies]
 *             properties:
 *               title: { type: string }
 *               author: { type: string }
 *               totalCopies: { type: integer }
 *     responses:
 *       201: { description: Book added }
 */
exports.addBook = async (req, res, next) => {
  try {
    const { title, author, isbn, totalCopies } = req.body;
    const book = new Book({
      title,
      author,
      isbn: isbn || `ISBN-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      totalCopies,
      availableCopies: totalCopies
    });
    await book.save();
    sendResponse(res, 201, 'Book added successfully', book);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /admin/books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               author: { type: string }
 *               totalCopies: { type: integer }
 *     responses:
 *       200: { description: Book updated }
 */
exports.updateBook = async (req, res, next) => {
  try {
    const { title, author, totalCopies } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) return sendResponse(res, 404, 'Book not found');

    if (totalCopies !== undefined) {
      const diff = totalCopies - book.totalCopies;
      book.totalCopies = totalCopies;
      book.availableCopies += diff; 
      
      if (book.availableCopies < 0) {
         return sendResponse(res, 400, 'Cannot reduce copies below currently borrowed amount');
      }
    }

    if (title) book.title = title;
    if (author) book.author = author;

    await book.save();
    sendResponse(res, 200, 'Book updated', book);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /admin/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *     responses:
 *       200: { description: Book deleted }
 */
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return sendResponse(res, 404, 'Book not found');
    sendResponse(res, 200, 'Book deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /admin/books:
 *   get:
 *     summary: Get all books (Paginated)
 *     tags: [Admin]
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
 *       200: 
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: 
 *                   type: object
 *                   properties:
 *                     books: { type: array }
 *                     currentPage: { type: integer }
 */
exports.getAllBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments();

    sendResponse(res, 200, 'Books retrieved', {
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    sendResponse(res, 200, 'Students retrieved', students);
  } catch (error) {
    next(error);
  }
};

exports.getAllBorrowedBooks = async (req, res, next) => {
  try {
    const records = await Registration.find({ status: 'borrowed' })
      .populate('studentId', 'name email')
      .populate('bookId', 'title author');
    sendResponse(res, 200, 'Borrowed records', records);
  } catch (error) {
    next(error);
  }
};

exports.approveStudent = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if(!user) return sendResponse(res, 404, 'User not found');
        
        user.isApproved = true;
        await user.save();
        sendResponse(res, 200, 'User approved successfully', user);
    } catch (error) {
        next(error);
    }
}
