const express = require('express');
const router = express.Router();

router.use('/books', require('./booksRouter'));
router.use('/users', require('./usersRouter'));

module.exports = router;
