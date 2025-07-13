// Archivo: server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- 1. IMPORTACIONES ---
const db = require('./config/database');
const authRoutes = require('./routes/authRoutes'); // Importamos nuestras rutas de autenticación

// --- 2. INICIALIZACIÓN DE LA APP ---
const app = express();
const PORT = process.env.PORT || 8080;

// --- 3. CONFIGURACIÓN DE CORS ---
// Este bloque debe estar al principio para manejar las peticiones de pre-vuelo (OPTIONS).
const frontendURL = process.env.FRONTEND_URL;
if (!frontendURL) {
    console.warn("ADVERTENCIA: La variable de entorno FRONTEND_URL no está definida.");
}
const corsOptions = {
    origin: frontendURL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// --- 4. MIDDLEWARES DE PARSEO ---
// Estos deben ir después de CORS y antes de que se definan las rutas.
// Permiten que tu servidor entienda los datos JSON enviados desde el frontend.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 5. DEFINICIÓN DE RUTAS ---
// Ruta de bienvenida para saber que la API está viva.
app.get('/', (req, res) => {
    res.send('API de Plataforma Deportiva funcionando!');
});

// Le decimos a Express que CUALQUIER petición que empiece con '/api/auth'
// debe ser manejada por el router que importamos de 'authRoutes.js'.
app.use('/api/auth', authRoutes);

// --- 6. INICIO DEL SERVIDOR (Solo se llama UNA VEZ y al FINAL) ---
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    // Verificamos la conexión a la base de datos al iniciar para un feedback rápido.
    db.getConnection()
        .then(conn => {
            console.log("¡ÉXITO! Conexión a la base de datos de Railway confirmada.");
            conn.release();
        })
        .catch(err => {
            console.error("ERROR CRÍTICO AL INICIAR: No se pudo establecer una conexión con la base de datos.", err.code);
        });
});