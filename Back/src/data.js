const express = require('express');
const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 10000;

const dbConfig = {
    user: 'cmsuser',
    password: '1234',
    database: 'cmsdb',
    host: 'localhost',
    port: 5432,
};

const createClient = () => new Client(dbConfig);

app.use(cors());

app.get('/cms/sections', async (req, res) => {
    const client = createClient();

    try {
        await client.connect();

        const query = `
            SELECT s.section, json_agg(u) as users
            FROM sections s
            LEFT JOIN users u ON s.user_id = u.id
            GROUP BY s.section
            ORDER BY s.section
        `;

        const result = await client.query(query);

        const sectionsWithoutPasswords = result.rows.map(section => ({
            section: section.section,
            users: section.users.map(user => {
                delete require.cache[require.resolve('./output.json')];
                const submissions = require('./output.json');
                const userSubmissions = Object.values(submissions).flatMap(taskSubmissions =>
                    taskSubmissions[user.id] || []
                );

                return {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    username: user.username,
                    email: user.email,
                    timezone: user.timezone,
                    submissions: userSubmissions
                };
            })
        }));

        res.json(sectionsWithoutPasswords);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.end();
    }
});

app.get('/cms/users', async (req, res) => {
    const client = createClient();

    try {
        await client.connect();

        const query = `
            SELECT id, first_name, last_name, username, email FROM users
        `;

        const result = await client.query(query);

        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.end();
    }
});

app.get('/cms/comparisons/:id', async (req, res) => {
    const { id } = req.params;
    const client = createClient();

    try {
        await client.connect();

        const query = `
        SELECT *
        FROM comparisons
        WHERE (submission_id = $1 OR compared_contestant_id = $1) AND status = 1
    `;

        const result = await client.query(query, [id]);

        res.json(result.rows);
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
