// Archivo: config/database.js

const mysql = require('mysql2');
require('dotenv').config();

// Railway inyecta automáticamente esta variable de entorno con todos los datos de conexión.
const dbURL = process.env.MYSQL_URL;

if (!dbURL) {
    console.error("Error Crítico: La variable de entorno MYSQL_URL no está definida.");
    console.error("Asegúrate de que tu servicio de base de datos está correctamente vinculado en Railway.");
    process.exit(1); // Detiene la aplicación si no hay forma de conectar a la BD
}

console.log("Intentando conectar a la base de datos de Railway...");

const connection = mysql.createPool({
    uri: dbURL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Usamos .promise() para poder usar async/await en los controladores
module.exports = connection.promise();

console.log("Pool de conexiones a la base de datos de Railway configurado.");