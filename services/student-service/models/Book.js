const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 0,
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0,
  }
}, { timestamps: true }); // timestamps adds createdAt/updatedAt

module.exports = mongoose.model('Book', bookSchema);
