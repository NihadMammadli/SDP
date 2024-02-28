const { Client } = require('pg');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const checker = require('./checker.js');

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
                lastTimestamp = lastRow.timestamp;

                const output = {
                    task_id: lastRow.task_id,
                    participation_id: lastRow.participation_id,
                    submission_id: lastRow.id,
                    code: '',
                    submission_date: lastRow.timestamp
                };

                exec(`python3 /home/nihad/Desktop/Projects/SDP/Back/Python/downloader.py ${lastRow.id}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Error executing Python script:', error);
                        return;
                    }

                    output.code = stdout.trim();

                    updateOrCreateJson(output, () => {
                        checker.processAllProblems("./output.json");
                    });
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

function updateOrCreateJson(data, callback) {
    fs.readFile('output.json', (err, jsonString) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return;
        }

        let json = {};
        if (jsonString) {
            json = JSON.parse(jsonString);
        }

        const { task_id, participation_id, submission_id, code, submission_date } = data;

        if (!json[task_id]) {
            json[task_id] = {};
        }

        if (json[task_id] && json[task_id][participation_id] && json[task_id][participation_id][0]?.submission_id !== submission_id) {
            updateComparisonStatus(json[task_id][participation_id][0]?.submission_id);
        }

        delete json[task_id][participation_id];
        
        json[task_id][participation_id] = [{
            submission_id,
            code,
            submission_date
        }];

        fs.writeFile('output.json', JSON.stringify(json, null, 4), (err) => {
            if (err) {
                console.error('Error writing JSON file', err);
            } else {
                console.log('JSON file updated successfully');
            }

            callback();
        });
    });
}

async function updateComparisonStatus(submissionId) {
    try {
        const updateQuery = {
            text: 'UPDATE comparisons SET status = $1 WHERE submission_id = $2 OR compared_contestant_id = $2',
            values: [0, submissionId],
        };

        const { rowCount } = await client.query(updateQuery);

        console.log(`${rowCount} rows updated`);

    } catch (error) {
        console.error('Error updating comparison status:', error);
    }
}