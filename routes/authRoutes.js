const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para el registro de un nuevo usuario
router.post('/registrar', authController.registrar);

// Ruta para el inicio de sesión
router.post('/login', authController.login);

module.exports = router;