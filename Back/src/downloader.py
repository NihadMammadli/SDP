import sys
import requests
from bs4 import BeautifulSoup
import os

from dotenv import load_dotenv
load_dotenv()

def fetch_submission_content(submission_id):
    if submission_id:
        url = url = f"{os.getenv('CMS_ADMIN')}/login"
        username = 'nihad'
        password = 'vrmzyx'
        session = requests.Session()
        login_page_response = session.get(url)
        soup = BeautifulSoup(login_page_response.text, 'html.parser')
        xsrf_token = soup.find('input', {'name': '_xsrf'})['value']

        login_data = {
            '_xsrf': xsrf_token,
            'next': f'/submission_file/{submission_id}',
            'username': username,
            'password': password
        }

        login_response = session.post(url, data=login_data)

        if login_response.status_code == 200:
            submission_url = f'{os.getenv("CMS_ADMIN")}/submission_file/{submission_id}'
            submission_response = session.get(submission_url)

            if submission_response.status_code == 200:
                return submission_response.content
            else:
                return f'Request to {submission_url} failed with status code: {submission_response.status_code}'
        else:
            return f'Login failed with status code: {login_response.status_code}'
    else:
        return f'No file found for submission ID: {submission_id}'

# Example usage:
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python downloader.py <submission_id>")
        sys.exit(1)
    
    submission_id = int(sys.argv[1])
    content = fetch_submission_content(submission_id)
    print(content)
