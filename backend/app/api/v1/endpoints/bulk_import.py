import uuid
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.db.session import get_db
from app.models.user import User
from app.schemas.import_job import ImportJobOut
from app.models.import_job import ImportJob
from app.repositories.import_job_repository import ImportJobRepository
from app.services.bulk_import_service import BulkImportService
from app.core.exceptions import EntityNotFoundException, InvalidFileFormatException

router = APIRouter()


@router.post("/bulk-upload", response_model=ImportJobOut, status_code=status.HTTP_202_ACCEPTED)
async def upload_bulk_orders(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Upload a bulk order Excel (.xlsx) or CSV file.
    Creates an import job and processes it asynchronously in the background.
    """
    filename = file.filename or ""
    if not (filename.endswith(".xlsx") or filename.endswith(".csv")):
        raise InvalidFileFormatException("Unsupported format. Please upload an Excel (.xlsx) or CSV (.csv) file.")

    # Read bytes from file
    file_bytes = await file.read()

    # Create job tracking entry in DB
    job_repo = ImportJobRepository(db)
    job = ImportJob(
        job_id=uuid.uuid4(),
        status="Pending",
        success_count=0,
        failed_count=0,
        error_log=[]
    )
    created_job = await job_repo.create(job)
    await db.commit()  # commit to make job available in background session

    # Enqueue task using BackgroundTasks adapter
    bulk_service = BulkImportService()
    background_tasks.add_task(
        bulk_service.process_import,
        job_id=created_job.job_id,
        file_bytes=file_bytes,
        filename=filename
    )

    return created_job


@router.get("/import-jobs/{job_id}", response_model=ImportJobOut)
async def get_import_job_status(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Retrieve details and parsing progress logs for a specific bulk import job"""
    job_repo = ImportJobRepository(db)
    job = await job_repo.get_by_id(job_id)
    if not job:
        raise EntityNotFoundException("Import Job", job_id)
    return job
