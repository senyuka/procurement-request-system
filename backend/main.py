from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from datetime import datetime

from database import engine, get_db, Base
from models import ProcurementRequest, OrderLine, StatusHistory
import schemas
from ai_services import extract_text_from_pdf, extract_vendor_offer_data, classify_commodity_group
from commodity_groups import get_commodity_groups

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="askLio Procurement API")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "askLio Procurement API", "version": "1.0.0"}

@app.get("/api/commodity-groups")
def get_all_commodity_groups():
    """Get all available commodity groups"""
    return get_commodity_groups()

@app.post("/api/requests", response_model=schemas.ProcurementRequest)
def create_request(request: schemas.ProcurementRequestCreate, db: Session = Depends(get_db)):
    """Create a new procurement request"""

    # If commodity group not provided, classify it
    if not request.commodity_group_id:
        classification = classify_commodity_group(
            request.title,
            [line.dict() for line in request.order_lines]
        )
        commodity_group_id = classification.get("commodity_group_id")
        commodity_group = classification.get("commodity_group")
    else:
        commodity_group_id = request.commodity_group_id
        commodity_group = request.commodity_group

    # Create the request
    db_request = ProcurementRequest(
        requestor_name=request.requestor_name,
        title=request.title,
        vendor_name=request.vendor_name,
        vat_id=request.vat_id,
        commodity_group_id=commodity_group_id,
        commodity_group=commodity_group,
        total_cost=request.total_cost,
        department=request.department,
        status="Open"
    )

    # Add order lines
    for line in request.order_lines:
        db_line = OrderLine(**line.dict())
        db_request.order_lines.append(db_line)

    # Add initial status history
    status_hist = StatusHistory(
        old_status=None,
        new_status="Open",
        notes="Request created"
    )
    db_request.status_history.append(status_hist)

    db.add(db_request)
    db.commit()
    db.refresh(db_request)

    return db_request

@app.get("/api/requests", response_model=List[schemas.ProcurementRequest])
def get_requests(db: Session = Depends(get_db)):
    """Get all procurement requests"""
    requests = db.query(ProcurementRequest).order_by(ProcurementRequest.created_at.desc()).all()
    return requests

@app.get("/api/requests/{request_id}", response_model=schemas.ProcurementRequest)
def get_request(request_id: int, db: Session = Depends(get_db)):
    """Get a specific procurement request"""
    request = db.query(ProcurementRequest).filter(ProcurementRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request

@app.patch("/api/requests/{request_id}/status")
def update_request_status(
    request_id: int,
    status_update: schemas.StatusUpdate,
    db: Session = Depends(get_db)
):
    """Update the status of a procurement request"""
    request = db.query(ProcurementRequest).filter(ProcurementRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if status_update.new_status not in ["Open", "In Progress", "Closed"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    old_status = request.status
    request.status = status_update.new_status
    request.updated_at = datetime.utcnow()

    # Add status history
    status_hist = StatusHistory(
        request_id=request_id,
        old_status=old_status,
        new_status=status_update.new_status,
        notes=status_update.notes
    )
    db.add(status_hist)

    db.commit()
    db.refresh(request)

    return {"message": "Status updated successfully", "request": request}

@app.post("/api/upload-pdf", response_model=schemas.ExtractedData)
async def upload_pdf(file: UploadFile = File(...)):
    """Upload a PDF and extract vendor offer data"""

    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Save the uploaded file
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Extract text from PDF
        pdf_text = extract_text_from_pdf(file_path)

        # Use AI to extract structured data
        extracted_data = extract_vendor_offer_data(pdf_text)

        return schemas.ExtractedData(**extracted_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

    finally:
        # Clean up the uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
