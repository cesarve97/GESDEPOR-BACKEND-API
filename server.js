const express = require('express');
const cors = require('cors'); // Asegúrate de tenerlo: npm install cors
require('dotenv').config(); // Asegúrate de tenerlo: npm install dotenv

const app = express();

// --- CONFIGURACIÓN CRÍTICA DE CORS ---
const whiteList = [
    process.env.FRONTEND_URL, // La URL de tu frontend desplegado
    'http://localhost:5173'   // La URL de tu frontend en desarrollo local (Vite)
];
const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    }
};
app.use(cors(corsOptions));
// ------------------------------------

app.use(express.json()); // Para poder leer JSON en el body de las peticiones

// Rutas
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); // Todas las rutas de auth empezarán con /api/auth

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});