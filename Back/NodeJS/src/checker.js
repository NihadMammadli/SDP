const fs = require('fs');
const { promisify } = require('util');
const { EOL } = require('os');
const { Client } = require('pg');

const path = require('path');
const dbConfig = {
    user: 'cmsuser',
    password: '1234',
    database: 'cmsdb',
    host: 'localhost',
    port: 5432,
};
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
function remover(code) {
    const codeWithoutComments = [];
    let inMultilineComment = false;

    for (let line of code) {
        line = line.replace(/\/\/.*/, '');

        if (inMultilineComment) {
            if (line.includes('*/')) {
                inMultilineComment = false;
            }
            continue;
        } else if (line.includes('/*')) {
            inMultilineComment = true;
            if (line.includes('*/')) {
                inMultilineComment = false;
            }
            line = line.slice(0, line.indexOf('/*'));
        }

        line = line.trim();
        if (line && !line.startsWith("int main() {") && !line.endsWith("}") && !/^\s*{\s*}$/.test(line) && !/^return 0;/.test(line) && !line.startsWith("#include")) {
            codeWithoutComments.push(line);
        }
    }

    return codeWithoutComments;
}

function lcs(X, Y) {
    const m = X.length, n = Y.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) {
        for (let j = 0; j <= n; j++) {
            if (i === 0 || j === 0) {
                dp[i][j] = 0;
            } else if (X[i - 1] === Y[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    return dp[m][n];
}

async function cppChecker(code1, code2) {
    const code1WithoutComments = remover(code1.split(EOL));
    const code2WithoutComments = remover(code2.split(EOL));

    const commonLinesCount = lcs(code1WithoutComments, code2WithoutComments);
    const totalLines = Math.max(code1WithoutComments.length, code2WithoutComments.length);
    const similarity = totalLines > 0 ? commonLinesCount / totalLines : 0;

    const commonLines = new Set(code1WithoutComments.filter(line => code2WithoutComments.includes(line)));

    return { similarity, commonLines };
}

async function comparer(jsonData) {
    const client = new Client(dbConfig);
    await client.connect();

    try {
        for (const taskID in jsonData) {
            const submissions = jsonData[taskID];
            for (const [file1ID, file1Data] of Object.entries(submissions)) {
                for (const [file2ID, file2Data] of Object.entries(submissions)) {
                    if (file1ID !== file2ID) {
                        const { similarity, commonLines } = await cppChecker(file1Data[0].code, file2Data[0].code);
                        const outerKey = file1Data[0]?.submission_id;
                        const innerKey = file2Data[0]?.submission_id;

                        const existingComparisonQuery = {
                            text: 'SELECT * FROM comparisons WHERE submission_id = $1 AND compared_contestant_id = $2',
                            values: [outerKey, innerKey],
                        };
                        const { rowCount } = await client.query(existingComparisonQuery);

                        if (rowCount === 0) {
                            const commonLinesList = Array.from(commonLines);

                            const insertQuery = {
                                text: 'INSERT INTO comparisons(submission_id, compared_contestant_id, similarity_score, status) VALUES($1, $2, $3, $4)',
                                values: [outerKey, innerKey, similarity * 100, 1], 
                            };

                            await client.query(insertQuery);

                            console.log(`Inserted comparison data for submission ${outerKey} and submission ${innerKey} in task ${taskID}`);
                        } else {
                            console.log(`Comparison data for submission ${outerKey} and submission ${innerKey} already exists in the database`);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        await client.end();
    }
}

async function processAllProblems(jsonFilePath) {
    try {
        console.log(jsonFilePath)
        const jsonData = JSON.parse(await readFileAsync(jsonFilePath, 'utf-8'));

        const jsonString = JSON.stringify(jsonData, null, 4); 

        await writeFileAsync("./output.txt", jsonString);

        comparer(jsonData);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

module.exports = { processAllProblems };

// const jsonFilePath = process.argv[2]; 
// processAllProblems(jsonFilePath);
