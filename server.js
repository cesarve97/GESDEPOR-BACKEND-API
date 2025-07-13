// Archivo: server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database');

const app = express();

const PORT = process.env.PORT || 8080;

// --- CONFIGURACIÓN DE CORS MEJORADA Y ROBUSTA ---

const frontendURL = process.env.FRONTEND_URL;
if (!frontendURL) {
    console.warn("ADVERTENCIA: La variable de entorno FRONTEND_URL no está definida.");
}

const corsOptions = {
    // 1. Origen: Solo permite peticiones desde la URL de tu frontend.
    origin: frontendURL,

    // 2. Métodos: Especifica qué métodos HTTP están permitidos.
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",

    // 3. Credenciales: Permite el envío de cookies o cabeceras de autorización.
    credentials: true,

    // 4. Pre-vuelo: Le dice al navegador que puede "cachear" la respuesta del OPTIONS por 1 hora.
    preflightContinue: false,
    optionsSuccessStatus: 204 // Un estándar más común para respuestas OPTIONS.
};

// 5. ¡Paso clave! Primero usa cors para manejar la petición OPTIONS.
app.use(cors(corsOptions));


// --- FIN DE LA CONFIGURACIÓN DE CORS ---

// --- RUTA ESPÍA PARA DEPURAR CORS ---
app.get('/api/debug/cors', (req, res) => {
    console.log("--- DEBUGGING CORS ---");
    const frontendUrl = process.env.FRONTEND_URL;
    console.log("La variable FRONTEND_URL que estoy usando es:", frontendUrl);
    console.log("----------------------");
    res.status(200).json({
        message: "Esta es la URL que mi configuración de CORS está esperando.",
        la_url_que_espero_es: frontendUrl
    });
});
// --- FIN DE RUTA ESPÍA ---


// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    // ... tu código de inicio
});


// Middlewares para parsear el cuerpo de la petición
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- RUTAS ---
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('API de Plataforma Deportiva funcionando correctamente!');
});

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    db.getConnection()
        .then(conn => {
            console.log("¡ÉXITO! Conexión a la base de datos de Railway confirmada.");
            conn.release();
        })
        .catch(err => {
            console.error("ERROR CRÍTICO AL INICIAR: No se pudo establecer una conexión con la base de datos.", err.code);
        });
});