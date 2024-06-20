const AppError = require('../utils/error/appError');
const catchAsync = require('../utils/error/catchAsync');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const models = require('../models');
const { createSendToken } = require('../utils/createSendToken');
const { sendMail } = require('../utils/sendMail');

exports.getMyProfile = catchAsync(async (req, res, next) => {
  const myProfile = await models.Users.findOne({
    where: { id: req.user.id },
  });
  if (!myProfile) return next(new AppError('Not found', 404));

  res.status(200).json({ data: myProfile });
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  const user = await models.Users.findOne({
    where: { id: req.user.id },
  });
  if (!user) return next(new AppError('Not found', 404));

  let { oldPassword, newPassword } = req.body;

  if (!(await bcrypt.compare(oldPassword, user.password)))
    return next(new AppError('Wrong Password', 400));

  await user.update({ password: await bcrypt.hash(newPassword, 12) });

  return res.status(200).json({ msg: 'Successfully updated' });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token,
    auth = req.headers?.authorization;
  if (auth?.startsWith('Bearer')) token = auth.split(' ')[1];
  if (!token) return next(new AppError('You are not logged in', 401));

  try {
    var decoded = await promisify(jwt.verify)(
      token,
      process.env.TOKEN_SECRET_KEY
    );
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token Expired', 498));
    } else {
      return next(new AppError('Token not valid', 401));
    }
  }

  req.user = {
    id: decoded.id,
    username: decoded.username,
    email: decoded.email,
    type: decoded.type,
  };

  next();
});

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await models.Users.findOne({
    where: { username, verificationCode: null }, // Verification code null means user has verified
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect username or password', 400));
  }

  let { token, refreshToken } = await createSendToken(user);

  res.status(200).json({ token, refreshToken });
});

exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const user = await models.Users.findOne({ where: { username } });
  if (user) {
    return next(new AppError('Username already in use', 409));
  }

  const newUser = await models.Users.create({
    username,
    email,
    password: await bcrypt.hash(password, 12),
  });

  // Send email verification
  await sendMail(newUser);

  res.status(200).json({ id: newUser.id });
});

exports.verify = catchAsync(async (req, res, next) => {
  const { id, code } = req.body;

  const user = await models.Users.findOne({
    where: {
      id: id,
      verificationCode: code,
      type: 'user',
    },
  });
  if (!user || new Date() - new Date(user.updatedAt) > 5 * 60000)
    return next(new AppError('Incorrect code', 400));

  let { token, refreshToken } = await createSendToken(user);

  await user.update({ verificationCode: null });

  return res.status(200).json({
    token,
    refreshToken,
  });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  let { refreshToken } = req.body;
  if (!refreshToken || typeof refreshToken !== 'string')
    return next(new AppError('Invalid Credentials', 400));

  let token,
    auth = req.headers.authorization;
  if (auth?.startsWith('Bearer')) token = auth.split(' ')[1];
  if (!token) return next(new AppError('You are not logged in', 401));

  let decoded = null;
  try {
    decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      decoded = jwt.decode(token);
    } else {
      return next(new AppError('Invalid token', 401));
    }
  }

  const user = await models.Users.findOne({ where: { id: decoded.id } });

  if (!user) {
    return res.status(401).json({
      status: 'Failed',
      message: 'Invalid token',
    });
  }

  if (user.refreshToken !== refreshToken) {
    return res.status(409).json({
      status: 'fail',
      message: 'Someone has logged to your account',
    });
  }

  let { token: t, refreshToken: rt } = await createSendToken(user);

  return res.status(200).json({ token: t, refreshToken: rt });
});
