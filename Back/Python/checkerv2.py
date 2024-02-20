import os
import asyncio
import json
import re
from concurrent.futures import ThreadPoolExecutor

def remover(code):
    code_without_comments = []
    in_multiline_comment = False

    for line in code:
        line = re.sub(r'//.*', '', line)

        if in_multiline_comment:
            if '*/' in line:
                in_multiline_comment = False
            continue
        elif '/*' in line:
            in_multiline_comment = True
            if '*/' in line:
                in_multiline_comment = False
            line = line[:line.index('/*')]

        line = line.strip()
        if line and not line.startswith("int main() {") and not line.endswith("}")  and not re.match(r'^\s*{\s*}$', line) and not re.match(r'^return 0;', line) and not line.startswith("#include"):
            code_without_comments.append(line)

    return code_without_comments

def lcs(X, Y):
    m, n = len(X), len(Y)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(m + 1):
        for j in range(n + 1):
            if i == 0 or j == 0:
                dp[i][j] = 0
            elif X[i - 1] == Y[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[m][n]

def cpp_checker(file1, file2):
    with open(file1, 'r') as f1, open(file2, 'r') as f2:
        code1 = f1.readlines()
        code2 = f2.readlines()

    code1_without_comments = remover(code1)
    code2_without_comments = remover(code2)

    common_lines_count = lcs(code1_without_comments, code2_without_comments)
    total_lines = max(len(code1_without_comments), len(code2_without_comments))

    similarity = common_lines_count / total_lines if total_lines > 0 else 0

    common_lines = set(code1_without_comments).intersection(code2_without_comments)

    return similarity, common_lines

async def comparer(folder_path, json_folder_path):
    files = os.listdir(folder_path)

    cpp_files = [file for file in files if file.endswith(".cpp")]

    if len(cpp_files) < 2:
        print("There are not enough C++ files in the folder for comparison.")
        return

    tasks = []
    with ThreadPoolExecutor(max_workers=4) as executor:
        loop = asyncio.get_event_loop()
        for i in range(len(cpp_files)):
            for j in range(len(cpp_files)):
                file_1_path = os.path.join(folder_path, cpp_files[i])
                file_2_path = os.path.join(folder_path, cpp_files[j])

                if cpp_files[i][:1] == cpp_files[j][:1]:
                    continue

                task = loop.run_in_executor(executor, cpp_checker, file_1_path, file_2_path)
                tasks.append((cpp_files[i], cpp_files[j], task))

    results = {}
    for file1_name, file2_name, task in tasks:
        similarity, common_lines_set = await task
        file1_name = os.path.splitext(file1_name)[0]
        file2_name = os.path.splitext(file2_name)[0]

        common_lines_list = list(common_lines_set) 

        outer_key = f"{file1_name}"
        inner_key = file2_name

        if outer_key not in results:
            results[outer_key] = {}

        results[outer_key][inner_key] = {"similarity": similarity * 100, "common_lines": common_lines_list}

        print(f"{file1_name}'s code's similarity to {file2_name}'s code is: {similarity * 100:.2f}%")

    json_filename = os.path.join(json_folder_path, "comparison_results.json")
    with open(json_filename, 'w') as json_file:
        json.dump(results, json_file, indent=4)

    print(f"Comparison results are saved in {json_filename}")

def process_all_problems(sorted_folder_path, json_folder_path):
    asyncio.run(comparer(sorted_folder_path, json_folder_path))

if __name__ == "__main__":
    sorted_folder_path = "/home/nihad/Desktop/Projects/SDP/Back/data/codes"
    json_folder_path = "/home/nihad/Desktop/Projects/SDP/Back/data/json"

    process_all_problems(sorted_folder_path, json_folder_path)
