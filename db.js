import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: '127.0.0.1:3306',
  user: 'web84_41',
  password: '#tle420Elt2025xxx',
  database: 'web84_db41'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Fehler bei der Datenbankverbindung:', err.stack);
    return;
  }
  console.log('✅ Mit MySQL verbunden.');
});

export default connection;
 