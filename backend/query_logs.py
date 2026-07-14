import asyncio
from app.db.session import AsyncSessionLocal
from app.models.lecture_log import LectureLog
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(LectureLog))
        logs = res.scalars().all()
        for log in logs[:10]:
            print(f"Inst: {log.institution_id}, Year: {log.academic_year}, Desig: n/a, Type: {log.lecture_type}")

if __name__ == "__main__":
    asyncio.run(main())
