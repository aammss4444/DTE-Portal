import uuid
from sqlalchemy import Column, String, ForeignKey, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.session import Base

class FaceUpdateRequest(Base):
    __tablename__ = "face_update_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    faculty_credential_id = Column(UUID(as_uuid=True), ForeignKey("faculty_credentials.id"), nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    status = Column(String(50), nullable=False, default="PENDING") # PENDING, APPROVED, REJECTED, USED
    reason = Column(String, nullable=True)
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
