const { Client } = require('pg');

const client = new Client({
    user: 'cmsuser',
    password: '1234',
    database: 'cmsdb',
    host: 'localhost',
    port: 5432,
});

client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL');

        client.query('LISTEN submissions;');
        
        setInterval(() => {
            client.query('NOTIFY submissions;');
        }, 5000);

        client.on('notification', async (notification) => {
            console.log('Received notification:', notification.payload);

            await handleNotification(notification.payload);
        });
    })
    .catch(error => console.error('Error connecting to PostgreSQL', error));

async function handleNotification(payload) {
    try {
        const query = `
        SELECT * FROM submissions;
      `;
  
      const result = await client.query(query);
      if (result.rows && result.rows.length > 0) {
          const lastRow = result.rows[result.rows.length - 1];
          console.log(lastRow);
      } else {
          console.log("No rows returned from the query.");
      }
    } catch (error) {
        console.error('Error handling notification:', error);
    }
}
