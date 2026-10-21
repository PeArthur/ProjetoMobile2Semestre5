const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const autenticar = require('../middleware/authMiddleware');

// 1. Cadastro
router.post('/register', authController.register);

// 2. Login
router.post('/login', authController.login);

// 3. Atualizar Perfil (Foto, Nome, Email, etc.) - Protegida
router.put('/profile', autenticar, authController.updateProfile);

module.exports = router;
