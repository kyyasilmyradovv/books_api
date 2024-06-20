const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const signToken = (user) => {
  let jwtData = {
    id: user.id,
    username: user.surname,
    email: user.email,
    type: user.type,
  };

  return jwt.sign(jwtData, process.env.TOKEN_SECRET_KEY, {
    expiresIn: process.env.TOKEN_DURATION || '1h',
  });
};

exports.createSendToken = async (user) => {
  let token = signToken(user);

  let refreshToken = uuid.v4();
  await user.update({ refreshToken });

  return { token, refreshToken };
};
