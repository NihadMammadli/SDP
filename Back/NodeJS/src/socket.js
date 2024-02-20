const { Client } = require('pg');
const { exec } = require('child_process');

const client = new Client({
    user: 'cmsuser',
    password: '1234',
    database: 'cmsdb',
    host: 'localhost',
    port: 5432,
});

let lastTimestamp = null;

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
            if (!lastTimestamp || lastRow.timestamp > lastTimestamp) {
                console.log(lastRow);
                lastTimestamp = lastRow.timestamp;
                
                exec(`python3 /home/nihad/Desktop/Projects/SDP/Back/Python/downloader.py ${lastRow.id}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Error executing Python script:', error);
                        return;
                    }
                    console.log('Python script output:', stdout);
                });
            } else {
                console.log("No new data.");
            }
        } else {
            console.log("No rows returned from the query.");
        }
    } catch (error) {
        console.error('Error handling notification:', error);
    }
}
