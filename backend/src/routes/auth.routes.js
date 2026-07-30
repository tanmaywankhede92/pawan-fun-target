const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimiter');
const { loginValidator, refreshValidator, logoutValidator } = require('../validators/auth.validator');

const router = Router();

router.post('/login', authLimiter, validate(loginValidator), authController.login);
router.post('/refresh', authLimiter, validate(refreshValidator), authController.refresh);
router.post('/logout', validate(logoutValidator), authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/me', authenticate, authController.me);

module.exports = router;

   