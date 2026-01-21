from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict
from schemas.survey import SurveySubmission
from database import get_database
from datetime import datetime
from Agents.profile_agent import analyze_learner
from utils.auth import get_current_user
import uuid

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

LEARNING_STYLE_MAP = {
    # Q1-Q20 (Simplified mapping as in JS)
    **{f'q{i}_a': {'visual': 10, 'reading': 0, 'kinesthetic': 0} for i in range(1, 21)},
    **{f'q{i}_b': {'visual': 0, 'reading': 10, 'kinesthetic': 0} for i in range(1, 21)},
    **{f'q{i}_c': {'visual': 0, 'reading': 0, 'kinesthetic': 10} for i in range(1, 21)},
}

def calculate_learning_style(responses):
    scores = {"visual": 0, "reading": 0, "kinesthetic": 0}
    for resp in responses:
        for option_id in resp.get('selectedOptions', []):
            style_scores = LEARNING_STYLE_MAP.get(option_id)
            if style_scores:
                scores['visual'] += style_scores['visual']
                scores['reading'] += style_scores['reading']
                scores['kinesthetic'] += style_scores['kinesthetic']
    
    total = sum(scores.values())
    if total > 0:
        for key in scores:
            scores[key] = round((scores[key] / total) * 100)
    return scores

@router.get("/status")
async def get_status(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "completed": current_user.get("onboardingCompleted", False),
        "completedAt": current_user.get("onboardingCompletedAt"),
        "learningStyle": current_user.get("learningStyle")
    }

@router.post("/submit")
async def submit_survey(submission: SurveySubmission, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    # Check if user already completed
    if current_user.get("onboardingCompleted"):
        raise HTTPException(status_code=400, detail="Onboarding already completed")

    userId = current_user["_id"]

    # Convert Pydantic model to list of dicts for processing
    responses_list = [resp.model_dump() for resp in submission.responses]
    
    # Calculate scores
    learning_style = calculate_learning_style(responses_list)
    
    # Generate AI Summary using Profile Agent
    try:
        # We need to add questionText as expected by analyze_learner
        # In the real app, this would be fetched from a questions DB
        # For now, we mock the enrichments
        summary = analyze_learner(responses_list)
    except Exception as e:
        print(f"Agent Error: {e}")
        summary = "Analytical summary pending..."

    # Update User
    await db.users.update_one(
        {"_id": userId},
        {
            "$set": {
                "onboardingCompleted": True,
                "onboardingCompletedAt": datetime.now(),
                "learningStyle": learning_style,
                "learnerTypeSummary": summary
            }
        }
    )
    
    return {
        "success": True,
        "message": "Survey submitted successfully",
        "learningStyle": learning_style
    }
