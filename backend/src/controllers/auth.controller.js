const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const { HTTP_STATUS } = require('../constants');

const login = catchAsync(async (req, res) => {
  const { username, password, device, deviceUuid } = req.body;
  const result = await authService.login(username, password, {
    device,
    deviceUuid,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Login successful',
    accessToken: result.accessToken,
    user: result.user,
    redirect: result.redirect,
  });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user.id);
  ApiResponse.success(res, HTTP_STATUS.OK, 'Logout successful');
});

const me = catchAsync(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  ApiResponse.success(res, HTTP_STATUS.OK, 'User profile', { user });
});

module.exports = { login, logout, me };
