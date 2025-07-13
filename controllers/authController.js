// Archivo: controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database'); // db ya viene con promesas

exports.registrar = async (req, res) => {
    console.log("-----------------------------------------");
    console.log("RECIBIDA PETICIÓN EN /api/auth/registrar");
    console.log("Datos recibidos en el body:", req.body);
    console.log("-----------------------------------------");

    const { nombre, apellido, email, password } = req.body;

    if (!email || !password || !nombre) {
        console.error("Error de validación: Faltan campos obligatorios.");
        return res.status(400).json({ message: 'Por favor, proporciona al menos nombre, email y contraseña.' });
    }

    try {
        console.log(`Paso 1: Verificando si el email '${email}' ya existe...`);
        // CORRECCIÓN: Se elimina .promise()
        const [usuarios] = await db.query('SELECT email FROM usuarios WHERE email = ?', [email]);
        
        if (usuarios.length > 0) {
            console.warn(`Advertencia: El email '${email}' ya está en uso.`);
            return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
        }
        console.log("Paso 1 completado: El email está disponible.");

        console.log("Paso 2: Encriptando la contraseña...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("Paso 2 completado: Contraseña encriptada.");

        const nuevoUsuario = {
            nombre,
            apellido: apellido || null,
            email,
            password: hashedPassword,
            tipo_usuario_id: 1,
            estado_id: 1,
        };
        
        console.log("Paso 3: Intentando insertar el siguiente objeto en la BD:", nuevoUsuario);
        // CORRECCIÓN: Se elimina .promise()
        const [result] = await db.query('INSERT INTO usuarios SET ?', nuevoUsuario);
        
        console.log("¡ÉXITO! Usuario insertado con ID:", result.insertId);
        res.status(201).json({ message: 'Usuario registrado con éxito.', userId: result.insertId });

    } catch (error) {
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("ERROR CATASTRÓFICO DURANTE EL REGISTRO:");
        console.error("Código de error de MySQL:", error.code);
        console.error("Mensaje de error de MySQL:", error.message);
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        res.status(500).json({ message: 'Error en el servidor al registrar el usuario.' });
    }
};

// ¡Importante! Si tienes una función login, también debes corregirla de la misma manera.
exports.login = async (req, res) => {
    const { email, password } = req.body;
    // ... tu lógica de login ...
    try {
        // CORRECCIÓN: Se elimina .promise()
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        // ... resto de tu lógica de login ...
    } catch (error) {
        // ... tu manejo de errores ...
    }
};