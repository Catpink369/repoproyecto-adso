const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://guramaonline_user:Wt6DDf1LfWbI5R6FZXKumUbIndxBufb1@dpg-dag51bp594qs73fsnrf0-a.virginia-postgres.render.com/guramaonline",
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  const { rows } = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
  );
  for (const { tablename } of rows) {
    await client.query(`ALTER TABLE "${tablename}" DISABLE TRIGGER ALL;`);
    console.log(`Triggers desactivados en ${tablename}`);
  }
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});