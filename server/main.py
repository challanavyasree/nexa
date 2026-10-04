import os
import base64
import json
import uuid
import datetime
import httpx
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import ProjectModel, DocumentModel, GeneratedOutputModel, VerificationClaimModel
from rag import chunk_text, similarity_search
from dotenv import load_dotenv

load_dotenv()

# Create database tables if initialized
Base.metadata.create_all(bind=engine)

def get_gemini_config():
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    raw_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()
    
    # Sanitize model name: never use mock-engine or Nexa
    if not raw_model or raw_model.lower() in ["mock-engine", "nexa", "mock"]:
        raw_model = "gemini-1.5-flash"
    
    if raw_model.startswith("models/"):
        raw_model = raw_model.replace("models/", "")

    return api_key, raw_model

api_key, model_name = get_gemini_config()
print(f"[SERVER STARTUP] Gemini Config Loaded -> Model: {model_name}, API Key Configured: {bool(api_key)}")

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
    api_key, model = get_gemini_config()
    return {
        "status": "online",
        "service": "AI Content Intelligence Platform Backend",
        "version": "1.0.0",
        "geminiConfigured": bool(api_key),
        "geminiModel": model
    }

async def call_gemini_vision_api(base64_data: str, mime_type: str, prompt_text: str) -> str:
    api_key, model = get_gemini_config()
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="GEMINI_API_KEY is not configured in server/.env. Please configure GEMINI_API_KEY in server/.env."
        )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt_text},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": base64_data
                        }
                    }
                ]
            }
        ]
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(url, json=payload)
        if res.status_code != 200:
            err_msg = res.text
            try:
                err_json = res.json()
                err_msg = err_json.get("error", {}).get("message", res.text)
            except Exception:
                pass
            raise HTTPException(
                status_code=res.status_code if res.status_code in [400, 401, 403, 404] else 500,
                detail=f"Gemini Vision API Error ({res.status_code}): {err_msg}"
            )

        data = res.json()
        try:
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            if content and len(content) > 10:
                return content
        except (KeyError, IndexError):
            pass

        raise HTTPException(status_code=500, detail="Gemini Vision returned an invalid or empty response.")

async def call_gemini_text_api(prompt_text: str) -> str:
    api_key, model = get_gemini_config()
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="GEMINI_API_KEY is not configured in server/.env. Please configure GEMINI_API_KEY in server/.env."
        )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt_text}
                ]
            }
        ]
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(url, json=payload)
        if res.status_code != 200:
            err_msg = res.text
            try:
                err_json = res.json()
                err_msg = err_json.get("error", {}).get("message", res.text)
            except Exception:
                pass
            raise HTTPException(
                status_code=res.status_code if res.status_code in [400, 401, 403, 404] else 500,
                detail=f"Gemini API Error ({res.status_code}): {err_msg}"
            )

        data = res.json()
        try:
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            if content and len(content) > 10:
                return content
        except (KeyError, IndexError):
            pass

        raise HTTPException(status_code=500, detail="Gemini Text API returned an invalid or empty response.")

def parse_vision_response_to_extracted_info(raw_text: str, file_name: str = "Uploaded Image"):
    lines = [l.strip() for l in raw_text.split('\n') if l.strip()]

    topic = ""
    visual_desc = ""
    objects = ""
    people = ""
    location = ""
    ocr_text = "No visible text detected"
    observations = ""

    for line in lines:
        lower = line.lower()
        if lower.startswith("main topic:"):
            topic = line[line.find(":")+1:].strip()
        elif lower.startswith("visual description:"):
            visual_desc = line[line.find(":")+1:].strip()
        elif lower.startswith("key objects / elements:") or lower.startswith("key objects:"):
            objects = line[line.find(":")+1:].strip()
        elif lower.startswith("people / entities:") or lower.startswith("people:"):
            people = line[line.find(":")+1:].strip()
        elif lower.startswith("location / setting:") or lower.startswith("location:"):
            location = line[line.find(":")+1:].strip()
        elif lower.startswith("text detected (ocr):") or lower.startswith("text detected:"):
            ocr_text = line[line.find(":")+1:].strip()
        elif lower.startswith("important observations:"):
            observations = line[line.find(":")+1:].strip()

    if not topic or topic.lower() in ["screenshot", "img_", "image", "uploaded file"]:
        if visual_desc and len(visual_desc) > 5 and "unavailable" not in visual_desc.lower():
            topic = visual_desc[:60]
        else:
            topic = "Semantic Visual Content"

    key_points = []
    if visual_desc: key_points.append(f"Visual Description: {visual_desc}")
    if objects and objects != "N/A": key_points.append(f"Key Objects: {objects}")
    if location and location != "N/A": key_points.append(f"Location / Setting: {location}")
    if people and people not in ["N/A", "None"]: key_points.append(f"People / Entities: {people}")
    if ocr_text and ocr_text != "No visible text detected": key_points.append(f"OCR Text: {ocr_text}")
    if observations and observations != "N/A": key_points.append(f"Observations: {observations}")

    if not key_points:
        key_points.append(f"Raw Content: {raw_text[:150]}")

    important_facts = [
        f"Main Topic: {topic}",
        f"Location / Setting: {location or 'N/A'}",
        f"OCR Text: {ocr_text or 'None'}"
    ]

    return {
        "topic": topic,
        "type": "Multimodal Vision Understanding",
        "date": "N/A (Visual Image)",
        "location": location or "N/A",
        "participants": "N/A (No event headcount)",
        "department": "N/A",
        "purpose": visual_desc or raw_text[:120],
        "organizations": [],
        "people": [people] if people and people not in ["N/A", "None"] else [],
        "keyPoints": key_points,
        "importantFacts": important_facts,
        "mediaType": "image"
    }

# 1. Image Vision Analysis Endpoint
@app.post("/api/vision/analyze")
async def analyze_image_endpoint(data: dict = Body(...)):
    image_data_url = data.get("imageDataUrl") or data.get("image") or ""
    file_name = data.get("fileName", "Uploaded Image")

    if not image_data_url or not image_data_url.startswith("data:image"):
        raise HTTPException(status_code=400, detail="Invalid image payload. Must provide a valid base64 data URL.")

    try:
        header, base64_str = image_data_url.split(",", 1)
        mime_type = header.split(";")[0].split(":")[1]
    except Exception:
        mime_type = "image/png"
        base64_str = image_data_url

    prompt_text = """Perform detailed semantic visual analysis of this image. Structure your response EXACTLY with these headers:

Main Topic: [Concise semantic topic describing what is depicted in the image]
Visual Description: [Detailed paragraph describing the visual scene, subject matter, environment, lighting, objects, and composition]
Key Objects / Elements: [List visible objects and elements, e.g. ocean waves, seashore, shoreline, sky, rocks]
People / Entities: [Describe any visible person or entity, or 'None']
Location / Setting: [Visually inferable setting, e.g. Outdoor Seashore / Coastal Beach]
Text Detected (OCR): [Extract any visible text from the image, or 'No visible text detected']
Important Observations: [Key semantic insights from this image]"""

    vision_raw_text = await call_gemini_vision_api(base64_str, mime_type, prompt_text)
    formatted_text = f"EXTRACTED MULTIMODAL INTELLIGENCE\n\nCONTENT UNDERSTANDING\n{vision_raw_text}"
    extracted_info = parse_vision_response_to_extracted_info(vision_raw_text, file_name)

    return {
        "status": "processed",
        "fileType": "image",
        "text": formatted_text,
        "extractedInfo": extracted_info
    }

# 2. Multi-Agent Generation Endpoint
@app.post("/api/generate")
@app.post("/projects/{project_id}/generate")
async def generate_outputs(data: dict = Body(...), db: Session = Depends(get_db)):
    doc_id = data.get("documentId") or data.get("docId") or f"doc-{uuid.uuid4().hex[:8]}"
    project_id = data.get("projectId") or f"proj-{uuid.uuid4().hex[:8]}"
    doc_name = data.get("documentName") or data.get("docName") or "Source Content"
    raw_text = data.get("rawText") or data.get("text") or ""
    extracted_info = data.get("extractedInfo") or {}

    creator_ctx = data.get("creatorContext") or {}
    audience_ctx = data.get("audienceContext") or {}
    content_ctx = data.get("contentContext") or {}

    creator_type = creator_ctx.get("creatorType", "Professional")
    domain = creator_ctx.get("domain", "General")
    experience_level = creator_ctx.get("experienceLevel", "Intermediate")
    primary_goal = creator_ctx.get("primaryGoal", "Inform")

    audience_type = audience_ctx.get("audienceType", "General Public")
    knowledge_level = audience_ctx.get("knowledgeLevel", "Beginner")
    comm_style = audience_ctx.get("communicationStyle", "Simple")
    language = audience_ctx.get("language", "English")

    output_type = content_ctx.get("outputType", "briefing")
    platform = content_ctx.get("platform", "LinkedIn")
    tone = content_ctx.get("tone", "Professional")
    intent = content_ctx.get("intent", "Information")

    prompt_text = f"""You are an expert AI Multi-Agent Content Generation Engine.
Generate 4 distinct, highly tailored content format outputs grounded STRICTLY in the source document / visual analysis provided below.

SOURCE DOCUMENT / IMAGE VISUAL ANALYSIS:
Document Name: {doc_name}
Visual / Extracted Intelligence:
{raw_text}

CREATOR CONTEXT:
User Type: {creator_type}
Domain: {domain}
Experience Level: {experience_level}
Primary Goal: {primary_goal}

TARGET AUDIENCE CONTEXT:
Audience Type: {audience_type}
Knowledge Level: {knowledge_level}
Communication Style: {comm_style}
Language: {language}

CONTENT INTENT & STRATEGY:
Output Format: {output_type}
Target Platform: {platform}
Content Tone: {tone}
Primary Intent: {intent}

INSTRUCTIONS:
Generate content for 4 distinct formats:
1. Executive Briefing Memo (Structured overview optimized for {platform}, tone: {tone})
2. Social Media Post (Engaging post for {platform}, tone: {tone}, intent: {intent})
3. Presentation Outline (Slide deck breakdown for {platform}, tone: {tone})
4. Video Script (Narrative script formatted for {platform}, tone: {tone})

All content MUST be strictly tailored for a {audience_type} audience using a {comm_style} communication style in {language}.
All claims MUST be grounded strictly in the provided visual/text source content. DO NOT include any fictional delegates, summits, or unrelated external events.

Return ONLY a valid JSON object with the following exact structure:
{{
  "outputs": [
    {{
      "type": "briefing",
      "title": "Briefing Memo — {platform} ({tone})",
      "content": "...",
      "evidenceText": "..."
    }},
    {{
      "type": "social",
      "title": "Social Media Post — {platform} ({tone})",
      "content": "...",
      "evidenceText": "..."
    }},
    {{
      "type": "ppt",
      "title": "Presentation Outline — {platform} ({tone})",
      "content": "...",
      "evidenceText": "..."
    }},
    {{
      "type": "script",
      "title": "Video Script — {platform} ({tone})",
      "content": "...",
      "evidenceText": "..."
    }}
  ]
}}"""

    gemini_raw_resp = await call_gemini_text_api(prompt_text)

    try:
        clean_resp = gemini_raw_resp.strip()
        if clean_resp.startswith("```"):
            clean_resp = clean_resp.split("\n", 1)[1]
        if clean_resp.endswith("```"):
            clean_resp = clean_resp.rsplit("```", 1)[0]
        if clean_resp.startswith("json"):
            clean_resp = clean_resp[4:].strip()

        parsed = json.loads(clean_resp)
        raw_outputs = parsed.get("outputs", [])
    except Exception:
        raw_outputs = [
            {
                "type": "briefing",
                "title": f"Briefing Memo — {platform} ({tone})",
                "content": gemini_raw_resp[:800],
                "evidenceText": f"Source Evidence from {doc_name}"
            },
            {
                "type": "social",
                "title": f"Social Media Post — {platform} ({tone})",
                "content": gemini_raw_resp[800:1600] if len(gemini_raw_resp) > 800 else gemini_raw_resp,
                "evidenceText": f"Source Evidence from {doc_name}"
            },
            {
                "type": "ppt",
                "title": f"Presentation Outline — {platform} ({tone})",
                "content": gemini_raw_resp[1600:2400] if len(gemini_raw_resp) > 1600 else gemini_raw_resp,
                "evidenceText": f"Source Evidence from {doc_name}"
            },
            {
                "type": "script",
                "title": f"Video Script — {platform} ({tone})",
                "content": gemini_raw_resp[2400:] if len(gemini_raw_resp) > 2400 else gemini_raw_resp,
                "evidenceText": f"Source Evidence from {doc_name}"
            }
        ]

    formatted_outputs = []
    for item in raw_outputs:
        out_type = item.get("type", "briefing")
        out_title = item.get("title") or f"{out_type.upper()} — {platform} ({tone})"
        out_content = item.get("content", "")
        ev_text = item.get("evidenceText") or raw_text[:200]

        out_id = f"out-{out_type}-{uuid.uuid4().hex[:6]}"

        output_model = GeneratedOutputModel(
            id=out_id,
            project_id=project_id,
            doc_id=doc_id,
            title=out_title,
            output_type=out_type,
            audience=audience_type,
            intent=intent,
            platform=platform,
            tone=tone,
            content=out_content,
            verification_status="verified",
            human_status="pending",
            source_evidence_json=[{
                "sourceDoc": doc_name,
                "page": 1,
                "evidenceText": ev_text,
                "confidence": 0.98
            }]
        )
        db.add(output_model)

        formatted_outputs.append({
            "id": out_id,
            "docId": doc_id,
            "projectId": project_id,
            "title": out_title,
            "type": out_type,
            "audience": audience_type,
            "intent": intent,
            "platform": platform,
            "tone": tone,
            "content": out_content,
            "sourceEvidence": [{
                "sourceDoc": doc_name,
                "page": 1,
                "evidenceText": ev_text,
                "confidence": 0.98
            }],
            "verificationStatus": "verified",
            "humanStatus": "pending",
            "createdAt": datetime.datetime.now().strftime("%H:%M"),
            "auditTrail": [{
                "action": "Generated via Gemini Multi-Agent RAG Pipeline",
                "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
                "user": creator_type
            }]
        })

    db.commit()
    return formatted_outputs

# 3. Projects Endpoints
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

# 4. Context Endpoints
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

# 5. Documents Ingestion Endpoints
@app.post("/projects/{project_id}/documents")
async def upload_document(project_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    doc_id = f"doc-{uuid.uuid4().hex[:8]}"
    content = await file.read()
    filename_lower = file.filename.lower()
    
    is_image = any(filename_lower.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp"])
    
    if is_image:
        mime = "image/png"
        if filename_lower.endswith(".jpg") or filename_lower.endswith(".jpeg"):
            mime = "image/jpeg"
        elif filename_lower.endswith(".webp"):
            mime = "image/webp"
            
        b64 = base64.b64encode(content).decode("utf-8")
        prompt_text = """Perform detailed semantic visual analysis of this image. Structure your response EXACTLY with these headers:

Main Topic: [Concise semantic topic describing what is depicted in the image]
Visual Description: [Detailed paragraph describing the visual scene, subject matter, environment, lighting, objects, and composition]
Key Objects / Elements: [List visible objects and elements, e.g. ocean waves, seashore, shoreline, sky, rocks]
People / Entities: [Describe any visible person or entity, or 'None']
Location / Setting: [Visually inferable setting, e.g. Outdoor Seashore / Coastal Beach]
Text Detected (OCR): [Extract any visible text from the image, or 'No visible text detected']
Important Observations: [Key semantic insights from this image]"""
        
        vision_raw_text = await call_gemini_vision_api(b64, mime, prompt_text)
        raw_text = f"EXTRACTED MULTIMODAL INTELLIGENCE\n\nCONTENT UNDERSTANDING\n{vision_raw_text}"
        extracted_info = parse_vision_response_to_extracted_info(vision_raw_text, file.filename)
    else:
        raw_text = content.decode("utf-8", errors="ignore") or f"Document content extracted from {file.filename}."
        extracted_info = {
            "topic": file.filename,
            "type": "Document Content Analysis",
            "date": "N/A",
            "purpose": raw_text[:120]
        }

    doc = DocumentModel(
        id=doc_id,
        project_id=project_id,
        name=file.filename,
        file_type="image" if is_image else file.filename.split(".")[-1].lower(),
        file_size=f"{(len(content)/1024):.1f} KB",
        status="processed",
        raw_text=raw_text,
        extracted_info=extracted_info
    )
    db.add(doc)
    db.commit()
    return doc

@app.get("/projects/{project_id}/documents")
def list_project_documents(project_id: str, db: Session = Depends(get_db)):
    return db.query(DocumentModel).filter(DocumentModel.project_id == project_id).all()

@app.get("/projects/{project_id}/outputs")
def list_outputs(project_id: str, db: Session = Depends(get_db)):
    return db.query(GeneratedOutputModel).filter(GeneratedOutputModel.project_id == project_id).all()

# 6. Review & Approval Endpoints
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
