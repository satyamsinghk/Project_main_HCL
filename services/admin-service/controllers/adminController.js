// Import Book and User and Registration (Refactored to use correct paths)
const Book = require('../../student-service/models/Book');
const User = require('../../auth-service/models/User'); 
const Registration = require('../../student-service/models/Registration');

// Book CRUD
exports.addBook = async (req, res) => {
  try {
    const { title, author, isbn, totalCopies } = req.body;
    const book = new Book({
      title,
      author,
      isbn: isbn || `ISBN-${Date.now()}-${Math.floor(Math.random()*1000)}`, // Auto-generate if missing
      totalCopies,
      availableCopies: totalCopies
    });
    await book.save();
    res.status(201).json({ message: 'Book added successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { title, author, totalCopies } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (totalCopies !== undefined) {
      const diff = totalCopies - book.totalCopies;
      book.totalCopies = totalCopies;
      book.availableCopies += diff; 
      if (book.availableCopies < 0) {
         return res.status(400).json({ message: 'Cannot reduce copies below currently borrowed amount' });
      }
    }
    if (title) book.title = title;
    if (author) book.author = author;
    await book.save();
    res.json({ message: 'Book updated', book });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const books = await Book.find().skip(skip).limit(limit);
    const total = await Book.countDocuments();
    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// User & Borrow Management

exports.getAllStudents = async (req, res) => {
  try {
    // Select isApproved as well
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getAllBorrowedBooks = async (req, res) => {
  try {
    const records = await Registration.find({ status: 'borrowed' })
      .populate('studentId', 'name email')
      .populate('bookId', 'title author');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.approveStudent = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: 'User not found' });
        
        user.isApproved = true;
        await user.save();
        res.json({ message: 'User approved successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}
