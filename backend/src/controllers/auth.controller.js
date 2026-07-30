const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants');
const config = require('../config');

const REFRESH_TOKEN_COOKIE = 'refreshToken';

const login = catchAsync(async (req, res) => {
  const { username, password, device, deviceUuid } = req.body;
  const result = await authService.login(username, password, {
    device,
    deviceUuid,
    ipAddress: req.ip,
    browser: req.get('user-agent'),
  });

  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Login successful',
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user,
    redirect: result.redirect,
  });
});

const refresh = catchAsync(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE] || req.body.refreshToken;
  if (!refreshToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Refresh token not found');
  }

  const result = await authService.refreshAccessToken(refreshToken);

  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Token refreshed',
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user,
  });
});

const logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE] || req.body.refreshToken;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.clearCookie(REFRESH_TOKEN_COOKIE);
  ApiResponse.success(res, HTTP_STATUS.OK, 'Logout successful');
});

const logoutAll = catchAsync(async (req, res) => {
  await authService.logoutAll(req.user.id);
  res.clearCookie(REFRESH_TOKEN_COOKIE);
  ApiResponse.success(res, HTTP_STATUS.OK, 'Logged out from all devices');
});

const me = catchAsync(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  ApiResponse.success(res, HTTP_STATUS.OK, 'User profile', { user });
});

module.exports = { login, refresh, logout, logoutAll, me };
