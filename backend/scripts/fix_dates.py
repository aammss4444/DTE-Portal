import asyncio
from app.db.session import AsyncSessionLocal
from app.models.advertisement import Advertisement
from sqlalchemy import update
from datetime import date

async def fix():
    async with AsyncSessionLocal() as db:
        await db.execute(update(Advertisement).values(application_end_date=date(2026, 12, 31)))
        await db.commit()
        print('Fixed dates')

if __name__ == '__main__':
    asyncio.run(fix())
