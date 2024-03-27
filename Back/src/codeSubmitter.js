const puppeteer = require('puppeteer');
const fs = require('fs').promises;

(async () => {
    const usersData = await fs.readFile('users.json');
    const users = JSON.parse(usersData);

    while (true) {
        try {

            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            const randomIndex = Math.floor(Math.random() * users.length);
            const randomUser = users[randomIndex];

            console.log(randomUser);

            await page.goto('http://localhost:8888/');

            await page.type('#username', randomUser.username);
            await page.type('#password', '12345678');

            await page.click('button.btn.btn-primary.btn-large[type=submit]');

            await page.goto('http://localhost:8888/tasks/Cube/submissions');

            await new Promise(resolve => setTimeout(resolve, 1000));

            const filePath = '/home/nihad/Desktop/Projects/SDP/Back/data/codes/Sample2.cpp';
            const fileInput = await page.$('input.input-xlarge');
            await fileInput.uploadFile(filePath);

            await page.click('button.btn.btn-success');

            console.log(`Submitted code for user: ${randomUser.username}`);

            await page.waitForSelector('button.btn.btn-warning');
            await page.click('button.btn.btn-warning');

            const randomDelay = Math.floor(Math.random() * 1000) + 2000;

            await browser.close();
        }
        catch {
            console.log("There was an error")
        }
    }
})();
