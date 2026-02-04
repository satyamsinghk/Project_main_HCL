const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  returnDate: {
    type: Date,
  },
  dueAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned'],
    default: 'borrowed',
  }
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
