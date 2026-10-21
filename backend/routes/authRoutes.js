const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// 1. Cadastro
router.post('/register', authController.register);

// 2. Login
router.post('/login', authController.login);

module.exports = router;
