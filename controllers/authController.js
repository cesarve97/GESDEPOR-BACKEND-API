const db = require('../config/database'); // Asumo que aquí tienes tu conexión a Railway
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// FUNCIÓN PARA REGISTRAR UN NUEVO USUARIO
exports.registrar = async (req, res) => {
    const { nombre, apellido, email, password, tipo_documento_id, numero_documento } = req.body;

    // Validación simple
    if (!email || !password || !nombre) {
        return res.status(400).json({ message: 'Por favor, proporciona nombre, email y contraseña.' });
    }

    try {
        // 1. Verificar si el email ya existe
        const [usuarios] = await db.promise().query('SELECT email FROM usuarios WHERE email = ?', [email]);
        if (usuarios.length > 0) {
            return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
        }

        // 2. Encriptar la contraseña (¡NUNCA guardes contraseñas en texto plano!)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Crear el nuevo usuario en la base de datos
        const nuevoUsuario = {
            nombre,
            apellido,
            email,
            password: hashedPassword,
            tipo_documento_id,
            numero_documento,
            tipo_usuario_id: 1, // 1 = cliente por defecto
            estado_id: 1,       // 1 = activo por defecto
        };

        const [result] = await db.promise().query('INSERT INTO usuarios SET ?', nuevoUsuario);
        
        res.status(201).json({ message: 'Usuario registrado con éxito.', userId: result.insertId });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error en el servidor al registrar el usuario.' });
    }
};


// FUNCIÓN PARA INICIAR SESIÓN
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, proporciona email y contraseña.' });
    }

    try {
        // 1. Buscar al usuario por su email
        const [usuarios] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (usuarios.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' }); // Mensaje genérico por seguridad
        }

        const usuario = usuarios[0];

        // 2. Comparar la contraseña proporcionada con la encriptada en la BD
        const esPasswordCorrecto = await bcrypt.compare(password, usuario.password);
        if (!esPasswordCorrecto) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 3. Si todo es correcto, crear un Token (JWT)
        const payload = {
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                es_admin: usuario.es_admin
            }
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET, // ¡Crea esta variable de entorno en Railway!
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token: token,
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error en el servidor al iniciar sesión.' });
    }
};