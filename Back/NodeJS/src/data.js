const express = require('express');
const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 9999;

const dbConfig = {
    user: 'cmsuser',
    password: '1234',
    database: 'cmsdb',
    host: 'localhost',
    port: 5432,
};

const createClient = () => new Client(dbConfig);

app.use(cors());

app.get('/api/users', async (req, res) => {
    const client = createClient();

    try {
        await client.connect();

        const usersQuery = 'SELECT * FROM users';
        const usersResult = await client.query(usersQuery);
        const users = usersResult.rows;

        const comparisonResultsPath = '/home/nihad/Desktop/Projects/cmsBack/data/json/comparison_results.json';
        const comparisonResults = await fs.readFile(comparisonResultsPath, 'utf-8');
        const comparisonResultsJson = JSON.parse(comparisonResults);

        for (const user of users) {
            const submissionsQuery = `SELECT id FROM submissions WHERE participation_id = ${user.id} ORDER BY timestamp DESC LIMIT 1`;
            const submissionsResult = await client.query(submissionsQuery);
            user.submissions = [];

            for (const submission of submissionsResult.rows) {
                const submissionFilePath = `/home/nihad/Desktop/Projects/cmsBack/data/codes/${user.id}_${submission.id}.cpp`;

                try {
                    const content = await fs.readFile(submissionFilePath, 'utf-8');

                    const comparisonKey = `${user.id}_${submission.id}`;
                    const similarityInfo = comparisonResultsJson[comparisonKey];

                    const submissionInfo = {
                        id: submission.id,
                        content,
                        files: [],
                    };

                    for (const fileKey in similarityInfo) {
                        const fileSimilarityInfo = similarityInfo[fileKey];
                        submissionInfo.files.push({
                            fileId: fileKey,
                            similarity: fileSimilarityInfo ? fileSimilarityInfo.similarity : null,
                            commonLines: fileSimilarityInfo ? fileSimilarityInfo.common_lines : null,
                        });
                    }

                    user.submissions.push(submissionInfo);
                } catch (readFileError) {
                    console.error(`Error reading file ${submissionFilePath}:`, readFileError);
                    user.submissions.push({
                        id: submission.id,
                        content: 'File not found or could not be read.',
                        files: [],
                    });
                }
            }
        }

        res.json({ users });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.end();
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
