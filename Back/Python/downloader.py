import requests
from bs4 import BeautifulSoup
import psycopg2
import os

download_dir = '/home/nihad/Desktop/Projects/cmsBack/data/codes'

db_config = {
    'user': 'cmsuser',
    'password': '1234',
    'database': 'cmsdb',
    'host': 'localhost',
    'port': 5432,
}

conn = psycopg2.connect(**db_config)
cursor = conn.cursor()

cursor.execute("""
    SELECT f.submission_id, f.filename, s.participation_id
    FROM files f
    JOIN (
        SELECT id, participation_id
        FROM submissions
        WHERE (participation_id, timestamp) IN (
            SELECT s.participation_id, MAX(s.timestamp)
            FROM submissions s
            GROUP BY s.participation_id
        )
    ) s ON f.submission_id = s.id
""")
file_data = cursor.fetchall()

cursor.close()
conn.close()

url = 'http://localhost:8889/login'
username = 'nihad'
password = 'vrmzyx'
session = requests.Session()
login_page_response = session.get(url)
soup = BeautifulSoup(login_page_response.text, 'html.parser')
xsrf_token = soup.find('input', {'name': '_xsrf'})['value']

login_data = {
    '_xsrf': xsrf_token,
    'next': '/submission_file/25',
    'username': username,
    'password': password
}

login_response = session.post(url, data=login_data)

if login_response.status_code == 200:
    print('Login successful')

    for file_name in os.listdir(download_dir):
        file_path = os.path.join(download_dir, file_name)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")

    for submission_id, filename, participation_id in file_data:
        submission_url = f'http://localhost:8889/submission_file/{submission_id}'
        submission_response = session.get(submission_url)

        if submission_response.status_code == 200:
            print(f'Request to {submission_url} successful')

            file_path = os.path.join(download_dir, f'{participation_id}_{submission_id}.cpp')
            with open(file_path, 'wb') as file:
                file.write(submission_response.content)

            print(f'File saved as {file_path}')
        else:
            print(f'Request to {submission_url} failed with status code: {submission_response.status_code}')
else:
    print(f'Login failed with status code: {login_response.status_code}')
