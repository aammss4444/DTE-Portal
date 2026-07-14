import urllib.request
import json
import sys

auth_req = urllib.request.Request(
    'http://127.0.0.1:8080/api/auth/login', 
    data=b'username=sp%40gmail.com&password=123456', 
    headers={'Content-Type': 'application/x-www-form-urlencoded'}
)
token = json.loads(urllib.request.urlopen(auth_req).read().decode())['access_token']

req = urllib.request.Request(
    'http://127.0.0.1:8080/api/vacancies/ai-analysis', 
    data=json.dumps({"institution_id": 16, "course_id": 26, "academic_year": "2026-27"}).encode(),
    headers={
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    }
)
print(urllib.request.urlopen(req).read().decode())
