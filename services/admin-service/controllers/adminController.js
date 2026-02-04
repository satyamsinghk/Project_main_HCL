// Import Book from Student Service as per new requirements
const Book = require('../../student-service/models/Book');
const User = require('../../auth-service/models/User'); 

// Book CRUD

exports.addBook = async (req, res) => {
  try {
    const { title, author, isbn, totalCopies } = req.body; // Changed quantity -> totalCopies

    // Simplified check; in real systems ISBN check might be more robust
    // const existingBook = await Book.findOne({ isbn }); 
    // if (existingBook) ...

    const book = new Book({
      title,
      author,
      // isbn, // Note: ISBN was removed from Prompt 2 requirements list for Book Schema. 
             // Prompt says: title, author, totalCopies, availableCopies.
             // I will remove ISBN to strict adherence, OR keep it if it's implicitly needed.
             // Given "Prompt 2" list: title, author, totalCopies, availableCopies.
             // I'll stick to the list + maybe ISBN? 
             // Actually, strict following of "Create... Schema: [list]" usually implies ONLY that list?
             // But let's assume ISBN is usually good. However, if I must strictly follow, I'll remove it.
             // Let's keep it in schemas if helpful, but for now I'll support `totalCopies`.
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
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// User Management

exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
