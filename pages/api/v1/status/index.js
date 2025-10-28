import database from "infra/database";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseMaxConnectionsResult = await database.query(
    "SELECT setting::int FROM pg_settings WHERE name='max_connections';",
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].setting;

  const databaseName = process.env.POSTGRES_DB;
  const databaseActiveConnectionsResult = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const databaseActiveConnectionsValue =
    databaseActiveConnectionsResult.rows[0].count;

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = parseFloat(
    databaseVersionResult.rows[0].server_version,
  );

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        max_connections: databaseMaxConnectionsValue,
        active_connections: databaseActiveConnectionsValue,
        version: databaseVersionValue,
      },
    },
  });
}
export default status;
