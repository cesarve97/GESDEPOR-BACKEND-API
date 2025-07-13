// Archivo: server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database'); // Importar para la verificación inicial

const app = express();

const PORT = process.env.PORT || 8080; // Railway asignará PORT

// --- CONFIGURACIÓN DE CORS ---
// Lee la URL del frontend desde las variables de entorno para mayor seguridad.
const frontendURL = process.env.FRONTEND_URL;

if (!frontendURL) {
    console.warn("ADVERTENCIA: La variable de entorno FRONTEND_URL no está definida. Las peticiones del frontend podrían ser bloqueadas por CORS.");
}

const corsOptions = {
    origin: frontendURL,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// --- RUTAS ---
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('API de Plataforma Deportiva funcionando!');
});

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    // Verificamos la conexión a la base de datos al iniciar para un feedback rápido
    db.getConnection()
        .then(conn => {
            console.log("¡ÉXITO! Conexión a la base de datos de Railway confirmada.");
            conn.release();
        })
        .catch(err => {
            console.error("ERROR CRÍTICO AL INICIAR: No se pudo establecer una conexión con la base de datos.", err.code);
        });
});