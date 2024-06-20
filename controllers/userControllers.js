const AppError = require('../utils/error/appError');
const catchAsync = require('../utils/error/catchAsync');
const models = require('../models');
const { search } = require('../utils/search');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  if (!req.user?.type === 'admin') return next(new AppError('No access', 403));

  // Handle queries
  let { keyword, sortBy, sortAs, limit, offset } = req.query;

  let where = search(keyword);

  const users = await models.Users.findAll({
    where,
    order: [[sortBy || 'id', sortAs || 'desc']],
    limit: limit || 20,
    offset: offset || 0,
  });
  if (!users) return next(new AppError('Not found', 404));

  return res.status(200).json({ data: users });
});

exports.getUser = catchAsync(async (req, res, next) => {
  if (!req.user?.type === 'admin') return next(new AppError('No access', 403));

  const user = await models.Users.findOne({ where: { id: req.params.id } });
  if (!user) return next(new AppError('Not found', 404));

  return res.status(200).send(user);
});

exports.editUser = catchAsync(async (req, res, next) => {
  if (!req.user?.type === 'admin') return next(new AppError('No access', 403));

  const user = await models.Users.findOne({
    where: { id: req.params.id },
  });
  if (!user) return next(new AppError('Not found', 404));

  let { type } = req.body;

  await user.update({ type });

  return res.status(200).send(user);
});
