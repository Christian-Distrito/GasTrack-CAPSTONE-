from collections.abc import AsyncGenerator
import os

from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.models import Role

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the .env file")

engine = create_async_engine(DATABASE_URL, echo=False, future=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def get_or_create_role_id(db: AsyncSession, role_name: str) -> int:
    role_id = await db.scalar(select(Role.role_id).where(Role.role_name == role_name))
    if role_id is not None:
        return role_id

    role = Role(role_name=role_name)
    db.add(role)

    try:
        await db.flush()
        return role.role_id
    except IntegrityError:
        role_id = await db.scalar(select(Role.role_id).where(Role.role_name == role_name))
        if role_id is None:
            raise
        return role_id
