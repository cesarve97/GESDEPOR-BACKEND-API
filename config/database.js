const mysql = require('mysql2');
require('dotenv').config();

// Railway proporciona una única URL de conexión en la variable de entorno MYSQL_URL
// Esta variable contiene el usuario, contraseña, host, puerto y nombre de la base de datos.

if (!process.env.MYSQL_URL) {
    throw new Error('La variable de entorno MYSQL_URL no está definida.');
}

const connection = mysql.createConnection(process.env.MYSQL_URL);

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos de Railway:', err);
        // Si no se puede conectar, es un error fatal, así que salimos.
        process.exit(1); 
    }
    console.log('Conexión a la base de datos de Railway exitosa.');
});

// Exportamos la conexión para que otros archivos puedan usarla
module.exports = connection;