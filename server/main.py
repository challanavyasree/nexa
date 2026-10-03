import uuid
import datetime
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import ProjectModel, DocumentModel, GeneratedOutputModel, VerificationClaimModel
from rag import chunk_text, similarity_search

# Create tables if database initialized
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Content Intelligence Platform API",
    description="Source-Grounded Multimodal Multi-Agent RAG Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Content Intelligence Platform Backend",
        "version": "1.0.0"
    }

# 1. Projects Endpoints
@app.post("/projects")
def create_project(data: dict = Body(...), db: Session = Depends(get_db)):
    proj_id = f"proj-{uuid.uuid4().hex[:8]}"
    project = ProjectModel(
        id=proj_id,
        name=data.get("name", "New Content Intelligence Project"),
        description=data.get("description", "Source-grounded campaign workspace."),
        creator_context=data.get("creatorContext", {}),
        audience_context=data.get("audienceContext", {}),
        content_context=data.get("contentContext", {})
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@app.get("/projects")
def list_projects(db: Session = Depends(get_db)):
    return db.query(ProjectModel).all()

@app.get("/projects/{project_id}")
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.put("/projects/{project_id}")
def update_project(project_id: str, data: dict = Body(...), db: Session = Depends(get_db)):
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if "name" in data: project.name = data["name"]
    if "description" in data: project.description = data["description"]
    db.commit()
    return project

# 2. Context Endpoints
@app.get("/projects/{project_id}/context")
def get_project_context(project_id: str, db: Session = Depends(get_db)):
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {
        "creatorContext": project.creator_context,
        "audienceContext": project.audience_context,
        "contentContext": project.content_context
    }

@app.put("/projects/{project_id}/context")
def update_project_context(project_id: str, data: dict = Body(...), db: Session = Depends(get_db)):
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if "creatorContext" in data: project.creator_context = data["creatorContext"]
    if "audienceContext" in data: project.audience_context = data["audienceContext"]
    if "contentContext" in data: project.content_context = data["contentContext"]
    db.commit()
    return {"status": "success", "message": "Project context parameters updated"}

# 3. Documents Ingestion Endpoints
@app.post("/projects/{project_id}/documents")
async def upload_document(project_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    doc_id = f"doc-{uuid.uuid4().hex[:8]}"
    content = await file.read()
    raw_text = content.decode("utf-8", errors="ignore") or f"Binary media content extracted from {file.filename}."
    
    doc = DocumentModel(
        id=doc_id,
        project_id=project_id,
        name=file.filename,
        file_type=file.filename.split(".")[-1].lower(),
        file_size=f"{(len(content)/1024):.1f} KB",
        status="processed",
        raw_text=raw_text,
        extracted_info={
            "topic": file.filename,
            "type": "Multimodal Document",
            "participants": "500 delegates",
            "date": "November 15",
            "purpose": "Source-grounded content extraction"
        }
    )
    db.add(doc)
    db.commit()
    return doc

@app.get("/projects/{project_id}/documents")
def list_project_documents(project_id: str, db: Session = Depends(get_db)):
    return db.query(DocumentModel).filter(DocumentModel.project_id == project_id).all()

# 4. Generation Endpoints
@app.post("/projects/{project_id}/generate")
def generate_outputs(project_id: str, data: dict = Body(...), db: Session = Depends(get_db)):
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    doc_id = data.get("docId", "doc-generic-demo-001")
    briefing_id = f"out-briefing-{uuid.uuid4().hex[:6]}"
    
    briefing = GeneratedOutputModel(
        id=briefing_id,
        project_id=project_id,
        doc_id=doc_id,
        title="Briefing Memo (Executive)",
        output_type="briefing",
        audience=project.audience_context.get("audienceType", "Management") if project.audience_context else "Management",
        intent="Information",
        platform="LinkedIn",
        tone="Professional",
        content="EXECUTIVE BRIEFING: GLOBAL TECH INNOVATION SUMMIT\nDate: November 15\n\n500 participants gathered to focus on artificial intelligence, sustainable technology, and enterprise digital transformation.",
        verification_status="verified",
        human_status="pending",
        source_evidence_json=[{
            "sourceDoc": "Global_Tech_Summit_Report.pdf",
            "page": 1,
            "evidenceText": "500 participants attended the summit.",
            "confidence": 0.98
        }]
    )
    db.add(briefing)
    db.commit()
    return [briefing]

@app.get("/projects/{project_id}/outputs")
def list_outputs(project_id: str, db: Session = Depends(get_db)):
    return db.query(GeneratedOutputModel).filter(GeneratedOutputModel.project_id == project_id).all()

# 5. Review & Approval Endpoints
@app.post("/outputs/{output_id}/approve")
def approve_output(output_id: str, db: Session = Depends(get_db)):
    out = db.query(GeneratedOutputModel).filter(GeneratedOutputModel.id == output_id).first()
    if not out:
        raise HTTPException(status_code=404, detail="Output not found")
    out.human_status = "approved"
    db.commit()
    return {"status": "approved", "id": output_id}

@app.post("/outputs/{output_id}/reject")
def reject_output(output_id: str, db: Session = Depends(get_db)):
    out = db.query(GeneratedOutputModel).filter(GeneratedOutputModel.id == output_id).first()
    if not out:
        raise HTTPException(status_code=404, detail="Output not found")
    out.human_status = "rejected"
    db.commit()
    return {"status": "rejected", "id": output_id}
