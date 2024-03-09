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
        client.query('LISTEN questions;');

        setInterval(() => {
            client.query('NOTIFY questions;');
        }, 5000);

        client.on('notification', async (notification) => {
            if(notification?.payload){
                console.log(notification.payload);
            }

            await handleNotification(notification.payload);
        });
    })
    .catch(error => console.error('Error connecting to PostgreSQL', error));



async function handleNotification(payload) {
    try {
        const query = `
                SELECT * FROM questions;
            `;

        const result = await client.query(query);
        if (result.rows && result.rows.length > 0) {
            const lastRow = result.rows[result.rows.length - 1];
            if (!lastTimestamp || lastRow.question_timestamp > lastTimestamp) {
                lastTimestamp = lastRow.question_timestamp;
                console.log(lastRow)

            } else {
                // console.log("No new data.");
            }
        } else {
            console.log("No rows returned from the query.");
        }
    } catch (error) {
        console.error('Error handling notification:', error);
    }
}