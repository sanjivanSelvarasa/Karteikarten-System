const express = require('express');
const authController = require('../2_controllers/auth.controller');
const { requireAuth } = require('../1_middleware/auth.middleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.me);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;
