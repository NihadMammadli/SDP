const { Client } = require('pg');

const dbConfig = {
    user: 'cmsuser',
    password: '1234',
    database: 'cmsdb',
    host: 'localhost',
    port: 5432,
};

const client = new Client(dbConfig);

client.connect()
  .then(() => {
    const query = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
    `;

    return client.query(query);
  })
  .then(result => {
    const tableNames = result.rows.map(row => row.table_name);
    console.log('Tables in the database:', tableNames);
  })
  .catch(err => console.error('Error:', err))
  .finally(() => {
    client.end();
  });
