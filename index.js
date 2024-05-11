const { Pool } = require('pg'); 

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'banco',
  password: '123456',
  port: 5432, 
});

async function registrarTransferencia(descripcion, fecha, monto, cuentaOrigen, cuentaDestino) {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const insertQuery = 'INSERT INTO transferencias (descripcion, fecha, monto, cuenta_origen, cuenta_destino) VALUES ($1, $2, $3, $4, $5)';
    await client.query(insertQuery, [descripcion, fecha, monto, cuentaOrigen, cuentaDestino]);

    const selectQuery = 'SELECT * FROM transferencias ORDER BY id DESC LIMIT 1';
    const { rows } = await client.query(selectQuery);
    const ultimaTransferencia = rows[0];

    await client.query('COMMIT');
    console.log('Última transferencia registrada:', ultimaTransferencia);
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error al registrar transferencia:', error);
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function ultimaTransferencia(cuenta) {
  try {
    const query = 'SELECT * FROM transferencias WHERE cuenta_origen = $1 OR cuenta_destino = $2 ORDER BY id DESC LIMIT 10';
    const { rows } = await pool.query(query, [cuenta, cuenta]);
    console.log('Últimas 10 transferencias de la cuenta', cuenta, ':', rows);
  } catch (error) {
    console.error('Error al consultar transferencias:', error);
  }
}

async function consultarSaldo(cuenta) {
  try {
    const query = 'SELECT saldo FROM cuentas WHERE id = $1';
    const { rows } = await pool.query(query, [cuenta]);
    if (rows.length === 0) {
      console.error('La cuenta no existe');
      return;
    }
    console.log('Saldo de la cuenta', cuenta, ':', rows[0].saldo);
  } catch (error) {
    console.error('Error al consultar saldo:', error);
  }
}

registrarTransferencia('Transferencia de fondos', '2024-05-11', 1000, 1, 2);
ultimaTransferencia(1);
consultarSaldo(1);
