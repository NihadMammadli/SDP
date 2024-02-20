import os
import asyncio
import json

from concurrent.futures import ThreadPoolExecutor
from functions.cpp_checker import cpp_checker

def line_count(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return sum(1 for line in file)

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
