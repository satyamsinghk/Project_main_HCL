const Registration = require('../models/Registration');
const Book = require('../models/Book');

// Get available books
exports.getAvailableBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find({ availableCopies: { $gt: 0 } })
      .skip(skip)
      .limit(limit);
    
    const total = await Book.countDocuments({ availableCopies: { $gt: 0 } });

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

// Get my borrowed books and due/fine info
exports.getMyBorrowRecords = async (req, res) => {
  try {
    const records = await Registration.find({ studentId: req.user.id }).populate('bookId', 'title author');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Borrow Book
exports.borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    
    // Check book availability
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies < 1) {
      return res.status(400).json({ message: 'Book not available' });
    }

    // Check if already borrowed and not returned? (Optional validation)
    
    // Create record
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks due

    const registration = new Registration({
      studentId: req.user.id,
      bookId,
      issueDate: Date.now(),
      returnDate: null, // explicit
      dueAmount: 0,
      status: 'borrowed'
    });

    // Update book quantity
    book.availableCopies -= 1;
    await book.save();
    await registration.save();

    res.status(201).json({ message: 'Book borrowed successfully', registration });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Return Book
exports.returnBook = async (req, res) => {
    try {
        const { registrationId } = req.body;
        const registration = await Registration.findById(registrationId);

        if(!registration){
            return res.status(404).json({message: "Registration record not found"});
        }
        if(registration.status === 'returned'){
            return res.status(400).json({message: "Book already returned"});
        }
        
        // Calculate dueAmount/fine
        // In a real app we'd compare returnDate vs dueDate calculated purely from issueDate or stored
        // Here we just update status
        registration.returnDate = new Date();
        registration.status = 'returned';
        
        // Mock fine logic if late
        // if (registration.returnDate > calculatedDueDate) ...

        await registration.save();

        // Increment book availability
        const book = await Book.findById(registration.bookId);
        if(book){
            book.availableCopies += 1;
            await book.save();
        }

        res.json({message: "Book returned", registration});
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}
