from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
import datetime
from database import Base

class ProjectModel(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    creator_context = Column(JSON, nullable=True)
    audience_context = Column(JSON, nullable=True)
    content_context = Column(JSON, nullable=True)

    documents = relationship("DocumentModel", back_populates="project")
    outputs = relationship("GeneratedOutputModel", back_populates="project")

class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"))
    name = Column(String)
    file_type = Column(String)
    file_size = Column(String)
    upload_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="uploaded")
    raw_text = Column(Text)
    extracted_info = Column(JSON, nullable=True)
    storage_reference = Column(String, nullable=True)

    project = relationship("ProjectModel", back_populates="documents")
    chunks = relationship("DocumentChunkModel", back_populates="document")

class DocumentChunkModel(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"))
    page_number = Column(Integer, default=1)
    chunk_text = Column(Text)
    embedding_json = Column(JSON, nullable=True)

    document = relationship("DocumentModel", back_populates="chunks")

class GeneratedOutputModel(Base):
    __tablename__ = "generated_outputs"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"))
    doc_id = Column(String, ForeignKey("documents.id"))
    title = Column(String)
    output_type = Column(String)
    audience = Column(String)
    intent = Column(String)
    platform = Column(String)
    tone = Column(String)
    content = Column(Text)
    verification_status = Column(String, default="verified")
    human_status = Column(String, default="pending")
    source_evidence_json = Column(JSON, nullable=True)
    audit_trail_json = Column(JSON, nullable=True)

    project = relationship("ProjectModel", back_populates="outputs")
    claims = relationship("VerificationClaimModel", back_populates="output")

class VerificationClaimModel(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True, index=True)
    output_id = Column(String, ForeignKey("generated_outputs.id"))
    claim_text = Column(Text)
    source_fact = Column(Text)
    status = Column(String, default="verified")
    source_value = Column(String, nullable=True)
    generated_value = Column(String, nullable=True)
    evidence_quote = Column(Text)
    source_doc = Column(String)
    page_number = Column(Integer, default=1)
    confidence = Column(Float, default=0.95)

    output = relationship("GeneratedOutputModel", back_populates="claims")
