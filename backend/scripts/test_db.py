import asyncio
from sqlalchemy import text
from app.db.session import engine

async def run():
    async with engine.begin() as conn:
        data=b'username=sp@gmail.com&password=123456'
        res = await conn.execute(text("SELECT email, institution_id FROM users WHERE institution_id = 16"))
        for row in res.fetchall():
            print(row)

asyncio.run(run())
