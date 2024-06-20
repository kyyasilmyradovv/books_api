const AppError = require('../utils/error/appError');
const catchAsync = require('../utils/error/catchAsync');
const models = require('../models');
const { search } = require('../utils/search');

exports.getAllBooks = catchAsync(async (req, res, next) => {
  // Handle queries
  let { keyword, sortBy, sortAs, limit, offset } = req.query;

  let where = search(keyword); // Returns object with search (if no keyword then returns empty object which will not affect fetch)

  const books = await models.Books.findAll({
    where,
    order: [[sortBy || 'id', sortAs || 'desc']],
    limit: limit || 20,
    offset: offset || 0,
  });
  if (!books) return next(new AppError('Not found', 404));

  return res.status(200).send(books);
});

exports.getBook = catchAsync(async (req, res, next) => {
  const book = await models.Books.findOne({ where: { id: req.params.id } });
  if (!book) return next(new AppError('Not found', 404));

  return res.status(200).send(book);
});

exports.addBook = catchAsync(async (req, res, next) => {
  // if (!req.user?.accesses?.includes('content'))
  //   return next(new AppError('No access', 403));

  let { title, author, publicationDate, genres } = req.body;

  const newBook = await models.Books.create({
    title,
    author,
    publicationDate,
    genres,
  });

  return res.status(201).send(newBook);
});

exports.editBook = catchAsync(async (req, res, next) => {
  // if (!req.user?.accesses?.includes('content'))
  //   return next(new AppError('No access', 403));

  let { title, author, publicationDate, genres } = req.body;

  const book = await models.Books.findOne({
    where: { id: req.params.id },
  });
  if (!book) return next(new AppError('Not found', 404));

  await book.update({ title, author, publicationDate, genres });

  return res.status(200).send(book);
});

exports.deleteBook = catchAsync(async (req, res, next) => {
  // if (!req.user?.accesses?.includes('content'))
  //   return next(new AppError('No access', 403));

  const book = await models.Books.findOne({
    where: { id: req.params.id },
  });
  if (!book) return next(new AppError('Not found', 404));

  await book.destroy();

  return res.status(204).send();
});
