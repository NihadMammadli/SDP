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
      SELECT * from sections;
    `;

    return client.query(query);
  })
  .then(result => {
    console.log('Tables in the database:', result.rows);
  })
  .catch(err => console.error('Error:', err))
  .finally(() => {
    client.end();
  });
