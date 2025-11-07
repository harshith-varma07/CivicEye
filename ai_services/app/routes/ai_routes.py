from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.ai_service import ai_service

router = APIRouter()

class LocationData(BaseModel):
    type: str = "Point"
    coordinates: List[float]
    address: str

class AnalyzeIssueRequest(BaseModel):
    issueId: Optional[str] = None
    title: str
    description: str
    category: str
    location: LocationData

class AnalyzeIssueResponse(BaseModel):
    predictedCategory: str
    confidence: float
    tags: List[str]
    isDuplicate: bool
    duplicateOf: Optional[str]
    similarity: float
    priority: str
    priorityScore: float
    estimatedResolutionTime: int

@router.post("/analyze-issue", response_model=AnalyzeIssueResponse)
async def analyze_issue(request: AnalyzeIssueRequest):
    """Analyze issue using AI models"""
    try:
        result = await ai_service.analyze_issue(request.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "AI Services"}

@router.get("/models/status")
async def get_models_status():
    """Get status of AI models"""
    from app.models.categorizer import categorizer
    
    return {
        "categorizer": {
            "loaded": True,
            "trained": categorizer.is_trained
        },
        "duplicateDetector": {
            "loaded": True
        },
        "priorityPredictor": {
            "loaded": True
        },
        "maintenancePredictor": {
            "loaded": True
        }
    }
