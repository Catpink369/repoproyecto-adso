const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://guramaonline_user:Wt6DDf1LfWbI5R6FZXKumUbIndxBufb1@dpg-dag51bp594qs73fsnrf0-a.virginia-postgres.render.com/guramaonline",
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  const { rows } = await client.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND column_default LIKE 'nextval(%'
  `);

  for (const { table_name, column_name } of rows) {
    const seqRes = await client.query(
      `SELECT pg_get_serial_sequence($1, $2) AS seq`,
      [table_name, column_name]
    );
    const seq = seqRes.rows[0].seq;
    if (!seq) continue;
    await client.query(
      `SELECT setval('${seq}', COALESCE((SELECT MAX("${column_name}") FROM "${table_name}"), 1))`
    );
    console.log(`Secuencia de ${table_name}.${column_name} ajustada`);
  }

  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});