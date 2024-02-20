const fs = require('fs');
const { promisify } = require('util');
const { exec } = require('child_process');
const { EOL } = require('os');
const path = require('path');

const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const execAsync = promisify(exec);

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

async function cppChecker(file1, file2) {
    const [code1, code2] = await Promise.all([readFileAsync(file1, 'utf-8'), readFileAsync(file2, 'utf-8')]);
    const code1WithoutComments = remover(code1.split(EOL));
    const code2WithoutComments = remover(code2.split(EOL));

    const commonLinesCount = lcs(code1WithoutComments, code2WithoutComments);
    const totalLines = Math.max(code1WithoutComments.length, code2WithoutComments.length);
    const similarity = totalLines > 0 ? commonLinesCount / totalLines : 0;

    const commonLines = new Set(code1WithoutComments.filter(line => code2WithoutComments.includes(line)));

    return { similarity, commonLines };
}

async function comparer(folderPath, jsonFolderPath) {
    try {
        const files = await readdirAsync(folderPath);
        const cppFiles = files.filter(file => file.endsWith('.cpp'));

        if (cppFiles.length < 2) {
            console.log("There are not enough C++ files in the folder for comparison.");
            return;
        }

        const tasks = [];
        for (let i = 0; i < cppFiles.length; i++) {
            for (let j = 0; j < cppFiles.length; j++) {
                const file1Path = path.join(folderPath, cppFiles[i]);
                const file2Path = path.join(folderPath, cppFiles[j]);

                if (cppFiles[i].charAt(0) === cppFiles[j].charAt(0)) {
                    continue;
                }

                const task = cppChecker(file1Path, file2Path);
                tasks.push({ file1Name: cppFiles[i], file2Name: cppFiles[j], task });
            }
        }

        const results = {};
        for (const { file1Name, file2Name, task } of tasks) {
            const { similarity, commonLines } = await task;
            const file1NameWithoutExtension = path.parse(file1Name).name;
            const file2NameWithoutExtension = path.parse(file2Name).name;

            const commonLinesList = Array.from(commonLines);

            const outerKey = file1NameWithoutExtension;
            const innerKey = file2NameWithoutExtension;

            results[outerKey] = results[outerKey] || {};
            results[outerKey][innerKey] = { similarity: similarity * 100, commonLines: commonLinesList };

            console.log(`${file1NameWithoutExtension}'s code's similarity to ${file2NameWithoutExtension}'s code is: ${similarity * 100}%`);
        }

        const jsonFilename = path.join(jsonFolderPath, "comparison_results.json");
        fs.writeFileSync(jsonFilename, JSON.stringify(results, null, 4));
        console.log(`Comparison results are saved in ${jsonFilename}`);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

function processAllProblems(sortedFolderPath, jsonFolderPath) {
    comparer(sortedFolderPath, jsonFolderPath);
}

const sortedFolderPath = "/home/nihad/Desktop/Projects/SDP/Back/data/codes";
const jsonFolderPath = "/home/nihad/Desktop/Projects/SDP/Back/data/json";

processAllProblems(sortedFolderPath, jsonFolderPath);
