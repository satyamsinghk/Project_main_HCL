const mongoose = require('mongoose');
const Book = require('./services/student-service/models/Book');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/library-system')
  .then(async () => {
    const count = await Book.countDocuments();
    console.log(`Total Books in DB: ${count}`);
    const books = await Book.find();
    console.log(JSON.stringify(books, null, 2));
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
