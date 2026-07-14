import urllib.request
import json
import sys

# use vit@gmail.com or sp@gmail.com to see what it is
auth_req = urllib.request.Request(
    'http://127.0.0.1:8080/api/auth/login', 
    data=b'username=s.admin%40gmail.com&password=123456', 
    headers={'Content-Type': 'application/x-www-form-urlencoded'}
)
token = json.loads(urllib.request.urlopen(auth_req).read().decode())['access_token']

# we can use get_assessment since admin can view it
req = urllib.request.Request(
    'http://127.0.0.1:8080/api/vacancies/assessment?institution_id=8786&course_id=1&academic_year=2026-27', 
    headers={
        'Authorization': 'Bearer ' + token
    }
)
print(urllib.request.urlopen(req).read().decode())
