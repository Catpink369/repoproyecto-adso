const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://guramaonline_user:Wt6DDf1LfWbI5R6FZXKumUbIndxBufb1@dpg-dag51bp594qs73fsnrf0-a.virginia-postgres.render.com/guramaonline",
  ssl: { rejectUnauthorized: false },
});

const TABLES = [
  'categoria', 'clasificacion', 'estado_pago', 'metodo_pago', 'rol_usuario',
  'tipo_documento', 'tipo_movimiento', 'tipo_pedido',
  'usuario', 'producto', 'material',
  'material_color', 'material_diseno', 'pedido',
  'detalles_pedido', 'pedido_personalizado', 'movimiento',
  'detalle_pedido_personalizado', 'movimiento_material', 'ticket_compra', 'notificacion',
];

async function run() {
  await client.connect();
  let total = 0;
  for (const t of TABLES) {
    const { rows } = await client.query(`SELECT COUNT(*) FROM "${t}"`);
    const n = Number(rows[0].count);
    total += n;
    console.log(`${t}: ${n}`);
  }
  console.log(`TOTAL: ${total}`);

  // Chequeo extra: huérfanos en detalles_pedido.precio_unitario (la columna nueva)
  const { rows: precios } = await client.query(
    `SELECT COUNT(*) FROM detalles_pedido WHERE precio_unitario = 0`
  );
  console.log(`detalles_pedido con precio_unitario en 0: ${precios[0].count}`);

  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});