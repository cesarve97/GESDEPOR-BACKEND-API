// Archivo: config/database.js

const mysql = require('mysql2');
require('dotenv').config();

// Usamos las variables que Railway inyecta de forma estándar y confiable.
// Estos son los nombres correctos basados en la lista que proporcionaste.
const dbConfig = {
    host:     process.env.MYSQLHOST,
    user:     process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port:     process.env.MYSQLPORT
};

// Verificación crítica para asegurar que las variables existen y no están vacías.
if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    console.error("Error Crítico: Faltan variables de entorno esenciales para la base de datos (MYSQLHOST, MYSQLUSER, MYSQLDATABASE).");
    console.error("Por favor, verifica que estas variables están definidas en tu servicio de backend en Railway y no están vacías.");
    process.exit(1); // Detiene la aplicación si no hay forma de conectar
}

console.log(`Intentando conectar a la base de datos '${dbConfig.database}' en el host '${dbConfig.host}'...`);

const pool = mysql.createPool({
    ...dbConfig, // Usa la configuración que acabamos de definir
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000 // Aumentamos el timeout por seguridad
});

// Exportamos el pool con promesas para poder usar async/await
module.exports = pool.promise();

console.log("Pool de conexiones a la base de datos de Railway configurado.");