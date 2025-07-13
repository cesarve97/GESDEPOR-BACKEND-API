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
        return res.status(400).json({ message: 'Por favor, proporciona al menos nombre, email y contraseña.' });
    }

    try {
        const [usuarios] = await db.query('SELECT email FROM usuarios WHERE email = ?', [email]);
        
        if (usuarios.length > 0) {
            return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = {
            nombre,
            apellido: apellido || null,
            email,
            password: hashedPassword,
            tipo_usuario_id: 1,
            estado_id: 1,
        };
        
        const [result] = await db.query('INSERT INTO usuarios SET ?', nuevoUsuario);
        
        console.log("¡ÉXITO! Usuario insertado con ID:", result.insertId);
        res.status(201).json({ message: 'Usuario registrado con éxito.', userId: result.insertId });

    } catch (error) {
        console.error("ERROR CATASTRÓFICO DURANTE EL REGISTRO:", error);
        res.status(500).json({ message: 'Error en el servidor al registrar el usuario.' });
    }
};


// --- FUNCIÓN DE LOGIN CORREGIDA Y COMPLETA ---
exports.login = async (req, res) => {
    console.log("-----------------------------------------");
    console.log("RECIBIDA PETICIÓN EN /api/auth/login");
    console.log("Body recibido:", req.body);
    console.log("-----------------------------------------");
    
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, proporciona email y contraseña.' });
    }

    try {
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (usuarios.length === 0) {
            console.warn("Login fallido: Usuario no encontrado.");
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }
        
        const usuario = usuarios[0];
        console.log("Usuario encontrado, comparando contraseñas...");

        const esPasswordCorrecto = await bcrypt.compare(password, usuario.password);

        if (!esPasswordCorrecto) {
            console.warn("Login fallido: La contraseña no coincide.");
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }
        
        console.log("Contraseña correcta. Creando token JWT...");
        
        const payload = {
            usuario: { 
                id: usuario.id, 
                email: usuario.email, 
                nombre: usuario.nombre 
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        console.log("Login exitoso. Enviando token y datos de usuario.");
        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token,
            usuario: { 
                id: usuario.id, 
                nombre: usuario.nombre, 
                email: usuario.email 
            }
        });

    } catch (error) {
        console.error("ERROR CATASTRÓFICO DURANTE EL LOGIN:", error);
        res.status(500).json({ message: 'Error en el servidor durante el inicio de sesión.' });
    }
};