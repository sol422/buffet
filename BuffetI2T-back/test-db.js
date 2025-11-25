const connection = require('./db/connection'); 

connection.query('SELECT * FROM usuario', (err, results) => {
  if (err) {
    console.error('❌ Error al ejecutar la consulta:', err.message);
    return;
  }

  console.log('📋 Usuarios en la base de datos:');
  console.table(results); 
});
  