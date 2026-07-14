import asyncio
import io
import httpx
from reportlab.pdfgen import canvas
from datetime import date

BASE_URL = "http://localhost:8080"
TEST_EMAIL = "candidate@example.com"
TEST_PASS = "password123"

def generate_pdf() -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(100, 750, "Dummy Resume: 10 years experience, PhD in Computer Science.")
    c.save()
    return buf.getvalue()

async def run_test():
    async with httpx.AsyncClient(timeout=30) as client:
        # 1. Login
        print(f"Logging in as {TEST_EMAIL}...")
        r = await client.post(f"{BASE_URL}/api/auth/login", data={
            "username": TEST_EMAIL,
            "password": TEST_PASS
        })
        print(r.text)
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Get an Advertisement ID
        r = await client.get(f"{BASE_URL}/api/advertisements/published")
        print("Ads response:", r.status_code, r.text)
        ads_data = r.json()
        if "items" in ads_data:
            ads = ads_data["items"]
        else:
            ads = ads_data.get("data", [])
        
        if not ads:
            print("No ads found!")
            return
        ad_id = ads[0]["id"]
        
        # 3. Create Application
        print("Creating application...")
        r = await client.post(f"{BASE_URL}/api/applications", headers=headers, json={
            "advertisement_id": str(ad_id),
            "applied_designation": "Test Lecturer",
            "cover_letter": ""
        })
        print("Create Application Response:", r.status_code, r.text)
        if r.status_code == 409:
            print("Already applied, fetching existing application...")
            r_my = await client.get(f"{BASE_URL}/api/applications/my", headers=headers)
            my_apps = r_my.json()["data"]
            app_id = [a["application_id"] for a in my_apps if str(a["advertisement_name"]) == ads[0]["course_name"] or True][0] # Just grab the first one
            print("Found existing app_id:", app_id)
        elif "data" in r.json():
            app_id = r.json()["data"]["id"]
        else:
            print("Failed to create application.")
            return
        
        # 4. Upload Resume
        print("Uploading resume...")
        pdf_bytes = generate_pdf()
        r = await client.post(
            f"{BASE_URL}/api/applications/{app_id}/documents",
            headers=headers,
            data={"document_type": "RESUME"},
            files={"documents": ("resume.pdf", pdf_bytes, "application/pdf")}
        )
        print("Upload Response:", r.status_code, r.text)

if __name__ == "__main__":
    asyncio.run(run_test())
