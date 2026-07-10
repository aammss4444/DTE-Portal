import asyncio
import datetime
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.api.auth import candidate_register
from app.schemas.user import CandidateRegister
from app.models.user import User
from app.models.candidate import Candidate
from app.models.candidate_qualification import CandidateQualification
from app.models.candidate_experience import CandidateExperience

async def main():
    email = "candidate2@example.com"
    async with AsyncSessionLocal() as db:
        # Check if already exists
        res = await db.execute(select(User).filter(User.email == email))
        user = res.scalars().first()
        
        if not user:
            user_in = CandidateRegister(
                email=email,
                password="password123",
                full_name="Jane Doe",
                phone_number="1234567890"
            )
            try:
                user = await candidate_register(user_in, db)
                print(f"Candidate {email} created successfully!")
            except Exception as e:
                print(f"Error creating candidate: {e}")
                return
        else:
            print(f"Candidate {email} already exists. Updating profile...")

        # Fetch candidate record
        cand_res = await db.execute(select(Candidate).filter(Candidate.user_id == user.id))
        candidate = cand_res.scalars().first()
        
        if not candidate:
            print("Candidate profile not found!")
            return

        # Update basic details
        candidate.father_name = "John Doe"
        candidate.date_of_birth = datetime.date(1995, 5, 15)
        candidate.gender = "Female"
        candidate.category = "OPEN"
        candidate.religion = "Hindu"
        candidate.nationality = "Indian"
        candidate.address = "123 Tech Lane, Pune"
        candidate.district = "Pune"
        candidate.state = "Maharashtra"
        candidate.pincode = "411001"
        candidate.aadhar_number = "123456789012"
        candidate.is_profile_complete = True

        # Clear existing qualifications and experiences to avoid duplicates
        await db.execute(CandidateQualification.__table__.delete().where(CandidateQualification.candidate_id == candidate.id))
        await db.execute(CandidateExperience.__table__.delete().where(CandidateExperience.candidate_id == candidate.id))
        
        # Add Qualifications
        q1 = CandidateQualification(
            candidate_id=candidate.id,
            degree="B.Tech in Computer Engineering",
            specialization="Computer Engineering",
            university="Pune University",
            year_of_passing=2017,
            percentage=78.5,
            is_highest=False
        )
        q2 = CandidateQualification(
            candidate_id=candidate.id,
            degree="M.Tech in Computer Engineering",
            specialization="Software Engineering",
            university="IIT Bombay",
            year_of_passing=2019,
            percentage=82.0,
            is_highest=True
        )
        db.add_all([q1, q2])

        # Add Experience
        e1 = CandidateExperience(
            candidate_id=candidate.id,
            institution_name="COEP Pune",
            designation="Lecturer",
            from_date=datetime.date(2019, 8, 1),
            to_date=datetime.date(2022, 5, 30),
            is_current=False,
            experience_type="Teaching"
        )
        e2 = CandidateExperience(
            candidate_id=candidate.id,
            institution_name="VJTI Mumbai",
            designation="Assistant Professor",
            from_date=datetime.date(2022, 8, 1),
            to_date=None,
            is_current=True,
            experience_type="Teaching"
        )
        db.add_all([e1, e2])

        await db.commit()
        print(f"Profile updated successfully for {email}!")

if __name__ == "__main__":
    asyncio.run(main())
