import asyncio
from app.db.session import AsyncSessionLocal
from app.api.auth import candidate_register
from app.schemas.user import CandidateRegister
from app.models.user import User
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        # Check if already exists
        res = await db.execute(select(User).filter(User.email == "candidate@example.com"))
        if res.scalars().first():
            print("Candidate candidate@example.com already exists. You can log in with password 'password123'.")
            return

        user_in = CandidateRegister(
            email="candidate@example.com",
            password="password123",
            full_name="Test Candidate",
            phone_number="9876543210"
        )
        try:
            await candidate_register(user_in, db)
            print("Candidate created successfully! Email: candidate@example.com | Password: password123")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
