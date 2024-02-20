const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 10000;

app.use(cors());

app.get('/api/synchronize', async (req, res) => {

    try {

        exec('python3 /home/nihad/Desktop/Projects/cmsBack/Python/downloader.py', (error, stdout, stderr) => {
            if (error) {
                console.error('Error running downloader.py:', error);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }

            exec('python3 /home/nihad/Desktop/Projects/cmsBack/Python/checker.py', (error, stdout, stderr) => {
                if (error) {
                    console.error('Error running checker.py:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                    return;
                }

                res.json({ status: 'finished' });
            });
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
