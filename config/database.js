// Archivo: config/database.js

const mysql = require('mysql2');
require('dotenv').config();

// En lugar de usar la URL completa, usamos las variables individuales que Railway inyecta.
// Esto es más robusto contra problemas de red y firewall internos.
const dbConfig = {
    host: process.env.MYSQLHOST,         // Host privado de la base de datos
    user: process.env.MYSQLUSER,         // Usuario
    password: process.env.MYSQLPASSWORD, // Contraseña
    database: process.env.MYSQLDATABASE, // Nombre de la base de datos
    port: process.env.MYSQLPORT          // Puerto
};

// Verificación para asegurarnos de que las variables existen
if (!dbConfig.host || !dbConfig.database) {
    console.error("Error Crítico: Las variables de entorno de la base de datos (MYSQLHOST, MYSQLDATABASE, etc.) no están definidas.");
    console.error("Asegúrate de que tu servicio de base de datos está correctamente vinculado en Railway.");
    process.exit(1); // Detiene la aplicación si no hay forma de conectar
}

console.log(`Intentando conectar a la base de datos '${dbConfig.database}' en el host '${dbConfig.host}'...`);

const pool = mysql.createPool({
    ...dbConfig, // Usa la configuración que acabamos de definir
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Timeout de conexión para evitar que se quede colgado indefinidamente
    connectTimeout: 10000 
});


// Exportamos el pool con promesas para usar async/await
module.exports = pool.promise();

console.log("Pool de conexiones a la base de datos de Railway configurado y listo.");