from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.import_job import ImportJob
import uuid
from typing import Optional


class ImportJobRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, job_id: uuid.UUID) -> Optional[ImportJob]:
        result = await self.db.execute(
            select(ImportJob).where(ImportJob.job_id == job_id)
        )
        return result.scalar_one_or_none()

    async def create(self, job: ImportJob) -> ImportJob:
        self.db.add(job)
        await self.db.flush()
        await self.db.refresh(job)
        return job

    async def update(self, job: ImportJob) -> ImportJob:
        self.db.add(job)
        await self.db.flush()
        await self.db.refresh(job)
        return job
