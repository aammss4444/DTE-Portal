import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import verify_password
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).filter(User.email == 's.admin@gmail.com'))
        user = result.scalars().first()
        if user:
            print(f"User found: {user.email}")
            print(f"Hashed password: {user.hashed_password}")
            print(f"Password '123456' matches? {verify_password('123456', user.hashed_password)}")
        else:
            print("User not found.")

if __name__ == "__main__":
    asyncio.run(main())
