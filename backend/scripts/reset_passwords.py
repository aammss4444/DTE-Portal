import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        hashed_password = get_password_hash("123456")
        
        users_to_update = [
            's.admin@gmail.com', 
            'admin@example.com', 
            'candidate@example.com', 
            'vit@gmail.com',
            'ro@example.com',
            'treasury@example.com'
        ]
        
        for email in users_to_update:
            result = await db.execute(select(User).filter(User.email == email))
            user = result.scalars().first()
            if user:
                user.hashed_password = hashed_password
                print(f"Updated password for {email} to '123456'")
            else:
                print(f"User {email} not found.")
            
        await db.commit()
        print("Done.")

if __name__ == "__main__":
    asyncio.run(main())
