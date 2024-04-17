import sys
import requests
from bs4 import BeautifulSoup
import json
import os

from dotenv import load_dotenv
load_dotenv()

with open('users.json') as f:
    users = json.load(f)

def fetch_submission_content():
    url = f"{os.getenv("CMS_ADMIN")}/login"
    username = 'nihad'
    password = 'vrmzyx'
    session = requests.Session()
    login_page_response = session.get(url)
    soup = BeautifulSoup(login_page_response.text, 'html.parser')
    xsrf_token = soup.find('input', {'name': '_xsrf'})['value']

    login_data = {
        '_xsrf': xsrf_token,
        'next': f'/users/add',
        'username': username,
        'password': password
    }

    login_response = session.post(url, data=login_data)

    if login_response.status_code == 200:
        for user in users:
            userData = {
                '_xsrf': xsrf_token,
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'username': user['username'],
                'password': '12345678', 
                'method': 'bcrypt',  
                'email': '',  
                'timezone': '',  
                'preferred_languages': 'aze'  
            }
            submission_url = f"{os.getenv("CMS_ADMIN")}/users/add"
            session.post(submission_url, data=userData)
            
    else:
        return f'Login failed with status code: {login_response.status_code}'


fetch_submission_content()
