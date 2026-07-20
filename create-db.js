const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '2060444765',
    });

    await connection.query('CREATE DATABASE IF NOT EXISTS `cashtracker` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Base de datos "cashtracker" verificada/creada exitosamente.');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error conectando a MySQL local:', error.message);
    process.exit(1);
  }
}

createDatabase();
