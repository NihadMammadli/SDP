const fs = require('fs');
const { promisify } = require('util');
const { EOL } = require('os');
const { Client } = require('pg');

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

function cppChecker(code1, code2) {
    const tokenSet1 = new Set(code1.split(/\b/).filter(token => token.trim()));
    const tokenSet2 = new Set(code2.split(/\b/).filter(token => token.trim()));

    const intersection = new Set([...tokenSet1].filter(token => tokenSet2.has(token)));
    const union = new Set([...tokenSet1, ...tokenSet2]);

    const similarity = union.size > 0 ? intersection.size / union.size : 0;

    return { similarity, commonTokens: Array.from(intersection) };
}

async function comparer(jsonData, io, participator) {
    const client = new Client(dbConfig);
    await client.connect();

    try {
        for (const taskID in jsonData) {
            const submissions = jsonData[taskID];
            for (const [file1ID, file1Data] of Object.entries(submissions)) {
                for (const [file2ID, file2Data] of Object.entries(submissions)) {
                    if (file1ID !== file2ID) {
                        const { similarity, commonLines } = await cppChecker(file1Data[0].code, file2Data[0].code);
                        if ((similarity * 100) > 70) {
                            if (participator == file1ID) {
                                const questionsData = await client.query({
                                    text: 'SELECT * FROM questions WHERE participation_id = $1',
                                    values: [participator],
                                });
                                if (questionsData.rows.length > 0) {
                                    questionsData.rows.forEach(async row => {
                                        if (row.subject && (row.subject.includes('#wc') || row.subject.includes('#print'))) {
                                            if (participator == file1ID) {
                                                const message = {
                                                    message: `⚠️ SCORING PRECEDING ANOTHER EVENT ⚠️ \n Contestant ${participator} submitted a code that has ${similarity * 100}% after an event related to that user!`,
                                                    id: participator
                                                }
                                                const insertQuery = {
                                                    text: 'INSERT INTO alarms(alarm_type_id, user_id) VALUES($1, $2)',
                                                    values: [3, participator],
                                                };

                                                await client.query(insertQuery);
                                                
                                                io.emit('scoringPreceding', message);
                                                participator = 0
                                            }
                                        }
                                    });
                                }
                                else {
                                    const message = {
                                        message: `⚠️ SIMILARITY ALARM ⚠️ \n Contestant ${participator} submitted a code that has ${similarity * 100}% similarity with the code of Contestant ${file2ID}!`,
                                        id: participator
                                    }
                                    const insertQuery = {
                                        text: 'INSERT INTO alarms(alarm_type_id, user_id) VALUES($1, $2)',
                                        values: [1, participator],
                                    };

                                    await client.query(insertQuery);

                                    io.emit('similarityAlarm', message);
                                    participator = 0
                                }
                            }
                        }
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

                        } else {
                            // console.log(`Comparison data for submission ${outerKey} and submission ${innerKey} already exists in the database`);
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

async function processAllProblems(jsonFilePath, io, participator) {
    try {
        console.log(jsonFilePath)
        const jsonData = JSON.parse(await readFileAsync(jsonFilePath, 'utf-8'));

        comparer(jsonData, io, participator);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

module.exports = { processAllProblems };

