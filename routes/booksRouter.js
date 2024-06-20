const express = require('express');
const { protect } = require('../controllers/authController');
const { checkInputs } = require('../utils/input/checkInputs');
const {
  getAllBooks,
  getBook,
  addBook,
  deleteBook,
  editBook,
} = require('../controllers/bookControllers');
const router = express.Router();

// Common routes (public, users & admin)
router.get('/', getAllBooks);
router.get('/:id', getBook);

// Admin routes
// router.use('/', protect);
router.post('/', checkInputs('book', 'create'), addBook);
router.put('/:id', checkInputs('book', 'update'), editBook);
router.delete('/:id', deleteBook);

module.exports = router;
