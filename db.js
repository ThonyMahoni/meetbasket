import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config(); // lädt .env-Datei

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, // getrennt!
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Fehler bei der Datenbankverbindung:', err.stack);
    return;
  }
  console.log('✅ Mit MySQL verbunden.');
});

export default connection;
