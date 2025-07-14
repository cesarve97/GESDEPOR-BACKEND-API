// Archivo: controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database'); // db ya viene con promesas

exports.registrar = async (req, res) => {
    console.log("-----------------------------------------");
    console.log("RECIBIDA PETICIÓN EN /api/auth/registrar");
    console.log("Datos recibidos en el body:", req.body);
    console.log("-----------------------------------------");

    const { 
        nombre, 
        apellido, 
        email, 
        password, 
        tipo_usuario_id, // Asumimos que el frontend envía 1 para Cliente, 2 para Propietario
        telefono, 
        fecha_nacimiento, 
        numero_documento 
    } = req.body;

    // 2. Validación de campos obligatorios
    if (!nombre || !email || !password || !tipo_usuario_id || !numero_documento) {
        return res.status(400).json({ message: 'Por favor, completa todos los campos obligatorios: nombre, email, contraseña, DNI y tipo de usuario.' });
    }

    // 2.1 Validación del número de documento (máximo 8 caracteres)
    if (numero_documento.length > 8) {
        return res.status(400).json({ message: 'El número de documento no puede tener más de 8 caracteres.' });
    }

    // 2.2 Validación adicional: solo números
    if (!/^\d+$/.test(numero_documento)) {
        return res.status(400).json({ message: 'El número de documento solo puede contener números.' });
    }

    // Usaremos una transacción porque si el usuario es "Propietario",
    // necesitamos insertar en dos tablas (usuarios y propietarios) de forma atómica.
    let connection; 
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 3. Verificamos que el email o el DNI no existan
        const [usuariosExistentes] = await connection.query(
            'SELECT email FROM usuarios WHERE email = ? OR numero_documento = ?', 
            [email, numero_documento]
        );
        
        if (usuariosExistentes.length > 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({ message: 'El correo electrónico o el DNI ya están en uso.' });
        }

        // 4. Hasheamos la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Creamos el objeto del nuevo usuario con todos los datos
        const nuevoUsuario = {
            nombre,
            apellido: apellido || null,
            email,
            password: hashedPassword,
            telefono: telefono || null,
            fecha_nacimiento: fecha_nacimiento || null,
            numero_documento,
            tipo_usuario_id, // Dinámico desde el formulario
            estado_id: 1, // Por defecto 'activo'
        };
        
        // 6. Insertamos el usuario en la tabla 'usuarios'
        const [result] = await connection.query('INSERT INTO usuarios SET ?', nuevoUsuario);
        const nuevoUsuarioId = result.insertId;
        
        console.log(`¡ÉXITO PARCIAL! Usuario base insertado con ID: ${nuevoUsuarioId}`);

        // 7. Si es un Propietario (tipo_usuario_id = 2), lo insertamos en la tabla 'propietarios'
        if (Number(tipo_usuario_id) === 2) {
            const nuevoPropietario = {
                id: nuevoUsuarioId, // El ID del propietario es el mismo que el del usuario
                estado_id: 1, // Por defecto 'pendiente de aprobación'
            };
            await connection.query('INSERT INTO propietarios SET ?', nuevoPropietario);
            console.log(`¡ÉXITO! Usuario ${nuevoUsuarioId} también registrado como Propietario.`);
        }

        // 8. Si todo fue bien, confirmamos la transacción
        await connection.commit();
        
        res.status(201).json({ message: 'Usuario registrado con éxito.', userId: nuevoUsuarioId });

    } catch (error) {
        // 9. Si algo falla, revertimos la transacción
        if (connection) {
            await connection.rollback();
        }
        console.error("ERROR CATASTRÓFICO DURANTE EL REGISTRO:", error);
        res.status(500).json({ message: 'Error en el servidor al registrar el usuario.' });
    } finally {
        // 10. Liberamos la conexión a la base de datos
        if (connection) {
            connection.release();
        }
    }
};


// --- FUNCIÓN DE LOGIN (SIN CAMBIOS, YA ES CORRECTA) ---
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