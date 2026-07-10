import asyncio
from app.db.session import AsyncSessionLocal
from app.modules.billing.service import BillingService
from app.models.user import User

async def test():
    async with AsyncSessionLocal() as db:
        service = BillingService()
        user = User(id=1, role='ADMIN')
        res, _ = await service.list_bills(db, user, None, None, None, None, None, None, None, None, 0, 10)
        print(res)

if __name__ == "__main__":
    asyncio.run(test())
