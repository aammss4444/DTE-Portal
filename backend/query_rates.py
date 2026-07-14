import asyncio
from app.db.session import AsyncSessionLocal
from app.models.rate_master import RateMaster
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(RateMaster))
        rates = res.scalars().all()
        for r in rates:
            print(f"Inst: {r.institution_id}, Year: {r.academic_year}, Desig: {r.designation}, Type: {r.lecture_type}, Active: {r.is_active}, To: {r.effective_to}")

if __name__ == "__main__":
    asyncio.run(main())
