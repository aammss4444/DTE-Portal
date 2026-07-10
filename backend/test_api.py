import requests
import json
import os
import sys
from dotenv import load_dotenv

# Load env BEFORE importing anything else
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

base_url = "http://127.0.0.1:8080"
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from app.core.security import create_access_token

token = create_access_token(subject="39") # User 39 is RO
headers = {"Authorization": f"Bearer {token}"}

resp = requests.get(f"{base_url}/api/billing/bills?current_approver_role=RO", headers=headers)
print(resp.status_code)
print(json.dumps(resp.json(), indent=2))
