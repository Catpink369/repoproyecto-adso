require('dotenv').config();

const mysql = require('mysql2/promise');
const { Client } = require('pg');

// Orden que respeta las foreign keys (de menos a más dependiente)
const TABLES_IN_ORDER = [
  'categoria', 'clasificacion', 'estado_pago', 'metodo_pago', 'rol_usuario',
  'tipo_documento', 'tipo_movimiento', 'tipo_pedido',
  'usuario', 'producto', 'material',
  'material_color', 'material_diseno', 'pedido',
  'detalles_pedido', 'pedido_personalizado', 'movimiento',
  'detalle_pedido_personalizado', 'movimiento_material', 'ticket_compra', 'notificacion',
];

// Columnas que en MariaDB son TINYINT(1) pero en Postgres son BOOLEAN
const BOOLEAN_COLUMNS_BY_TABLE = {
  material: ['estado'],
  material_color: ['estado'],
  material_diseno: ['estado'],
  producto: ['estado'],
  notificacion: ['leida'],
};

async function main() {
  const mysqlConn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'guramaOnline',
    supportBigNumbers: true,
    bigNumberStrings: true,
  });

  const pgClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pgClient.connect();

  for (const table of TABLES_IN_ORDER) {
    const [rows] = await mysqlConn.query(`SELECT * FROM \`${table}\``);

    if (rows.length === 0) {
      console.log(`${table}: 0 filas, se omite`);
      continue;
    }

    const boolCols = BOOLEAN_COLUMNS_BY_TABLE[table] || [];
    const columns = Object.keys(rows[0]);
    const colList = columns.map((c) => `"${c}"`).join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const insertSQL = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`;

    let inserted = 0;
    for (const row of rows) {
      const values = columns.map((c) => {
        let v = row[c];
        if (boolCols.includes(c)) v = v === 1 || v === '1' || v === true;
        return v;
      });
      try {
        await pgClient.query(insertSQL, values);
        inserted++;
      } catch (err) {
        console.error(`Error en ${table}, fila:`, row, err.message);
      }
    }
    console.log(`${table}: ${inserted}/${rows.length} filas insertadas`);
  }

  await mysqlConn.end();
  await pgClient.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
