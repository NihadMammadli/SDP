import os
import asyncio
from functions.comparer import comparer

def process_all_problems(sorted_folder_path, json_folder_path):
    asyncio.run(comparer(sorted_folder_path, json_folder_path))

if __name__ == "__main__":
    sorted_folder_path = "/home/nihad/Desktop/Projects/cmsBack/data/codes"
    json_folder_path = "/home/nihad/Desktop/Projects/cmsBack/data/json"

    process_all_problems(sorted_folder_path, json_folder_path)
