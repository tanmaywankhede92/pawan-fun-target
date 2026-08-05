const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { HTTP_STATUS, TOKEN_TYPES, USER_STATUS } = require('../constants');
const userRepository = require('../repositories/user.repository');

const authenticate = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access token expired');
    }
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid access token');
  }

  const user = await userRepository.findById(decoded.id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not found');
  }

  if (Number(user.status) !== USER_STATUS.ACTIVE) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account is inactive or suspended');
  }

  req.user = user;
  req.tokenType = TOKEN_TYPES.ACCESS;
  next();
});

module.exports = authenticate;
