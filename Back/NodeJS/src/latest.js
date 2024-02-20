const { Client } = require('pg');
const exec = require('child_process').exec;
const fs = require('fs');

// PostgreSQL database configuration
const dbConfig = {
    user: 'cmsuser',
    password: '1234',
    database: 'cmsdb',
    host: 'localhost',
    port: 5432,
};

const client = new Client(dbConfig);
client.connect();

const query = `
    SELECT id, participation_id, task_id, timestamp
    FROM (
        SELECT 
            id, 
            participation_id, 
            task_id, 
            timestamp, 
            ROW_NUMBER() OVER (PARTITION BY task_id, participation_id ORDER BY timestamp DESC) as rank
        FROM submissions
    ) ranked_submissions
    WHERE rank = 1;
`;

client.query(query, (err, res) => {
    if (err) {
        console.error('Error executing query', err);
        client.end();
        return;
    }

    const submissions = res.rows;
    const submissionMap = {};

    // Group submissions by task_id and then by participation_id
    submissions.forEach(submission => {
        const { id, participation_id, task_id, timestamp } = submission;

        if (!submissionMap[task_id]) {
            submissionMap[task_id] = {};
        }

        if (!submissionMap[task_id][participation_id]) {
            submissionMap[task_id][participation_id] = [];
        }

        submissionMap[task_id][participation_id].push({
            submission_id: id,
            submission_date: timestamp,
        });
    });

    const jsonData = {};

    for (const task_id in submissionMap) {
        jsonData[task_id] = {};
        for (const participation_id in submissionMap[task_id]) {
            const submissions = submissionMap[task_id][participation_id];
            jsonData[task_id][participation_id] = [];
            submissions.forEach(submission => {
                const { submission_id } = submission;
                const command = `python3 /home/nihad/Desktop/Projects/SDP/Back/Python/downloader.py ${submission_id}`;
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing Python script for submission ID ${submission_id}`, error);
                        return;
                    }
                    jsonData[task_id][participation_id].push({
                        submission_id: submission.submission_id,
                        code: stdout.trim(),
                        submission_date: submission.submission_date
                    });
                    fs.writeFile('output.json', JSON.stringify(jsonData, null, 4), (err) => {
                        if (err) {
                            console.error('Error writing JSON file', err);
                        } else {
                            console.log('JSON file created successfully');
                        }
                    });
                });
            });
        }
    }

    client.end();
});
