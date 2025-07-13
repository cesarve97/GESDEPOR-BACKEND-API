// Archivo: server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar la conexión para verificarla (opcional pero buena práctica)
const db = require('./config/database'); 

const app = express();


// --- CONFIGURACIÓN DE PUERTO PARA RAILWAY ---
// Railway asigna el puerto a través de la variable de entorno PORT.
// El valor 3001 es un fallback para cuando trabajes en tu máquina local.
const PORT = process.env.PORT || 3001;


// --- CONFIGURACIÓN DE CORS PARA PRODUCCIÓN ---
// Esto permite que tu frontend (ej. en Vercel) se comunique con tu backend en Railway.
const frontendURL = process.env.FRONTEND_URL;
if (!frontendURL) {
    console.warn("ADVERTENCIA: La variable de entorno FRONTEND_URL no está definida. CORS puede fallar.");
}
const corsOptions = {
    origin: frontendURL, // Solo permite peticiones desde la URL de tu frontend
    optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));


// --- MIDDLEWARES ---
app.use(express.json()); // Para parsear cuerpos de petición en formato JSON


// --- RUTAS ---
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


// --- RUTA DE VERIFICACIÓN (HEALTH CHECK) ---
// Es útil tener una ruta para saber si el servidor está vivo.
app.get('/', (req, res) => {
    res.send('API de Plataforma Deportiva funcionando correctamente!');
});


// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    // Verificamos la conexión a la base de datos al iniciar
    db.getConnection()
        .then(conn => {
            console.log("Conexión a la base de datos de Railway confirmada y lista.");
            conn.release(); // Libera la conexión
        })
        .catch(err => {
            console.error("ERROR: No se pudo establecer una conexión con la base de datos al iniciar.", err);
        });
});