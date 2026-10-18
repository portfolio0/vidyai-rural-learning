const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimit');
const { validate, schemas } = require('../middleware/validate');

const { protect } = require('../middleware/auth');

router.get('/register', (req, res) => {
  res.status(200).json({
    status: 'ok',
    endpoint: '/api/auth/register',
    method_expected: 'POST',
    message: 'To register, send a POST request with user details or open the frontend application.',
    frontend_url: 'https://vidyai-rural-learning.vercel.app/register',
  });
});

router.get('/test-email', ctrl.testEmailDiagnostic);

router.post('/register',        authLimiter, validate(schemas.register),       ctrl.register);
router.post('/verify-email',    authLimiter, validate(schemas.verifyEmail),    ctrl.verifyEmailOTP);
router.post('/resend-otp',      authLimiter, validate(schemas.resendOtp),       ctrl.resendEmailOTP);
router.post('/login',           authLimiter, validate(schemas.login),           ctrl.login);
router.post('/refresh',                                                         ctrl.refresh);
router.post('/logout',                                                          ctrl.logout);
router.get('/me',               protect,                                        ctrl.getMe);
router.post('/forgot-password', authLimiter, validate(schemas.forgotPassword),  ctrl.forgotPassword);
router.post('/reset-password',  authLimiter, validate(schemas.resetPassword),   ctrl.resetPassword);

module.exports = router;
