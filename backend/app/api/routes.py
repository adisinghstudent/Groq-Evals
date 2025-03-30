from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import PromptRequest, EvaluationResult, ModelsListResponse
from app.core.config import get_settings, Settings
import groq
import json

router = APIRouter()

def evaluate_responses(response1: str, response2: str) -> tuple[str, str, dict]:
    # Simple evaluation logic (to be enhanced with more sophisticated metrics)
    response1_len = len(response1.split())
    response2_len = len(response2.split())
    
    # Basic metrics
    metrics = {
        "length_ratio": min(response1_len, response2_len) / max(response1_len, response2_len),
        "response1_length": response1_len,
        "response2_length": response2_len
    }
    
    # Simple evaluation logic (this should be replaced with more sophisticated evaluation)
    if response1_len > response2_len:
        winner = "Model 1"
        reasoning = "Provided a more detailed response based on length"
    else:
        winner = "Model 2"
        reasoning = "Provided a more concise response"
    
    return winner, reasoning, metrics

@router.get("/models", response_model=ModelsListResponse)
async def get_available_models(settings: Settings = Depends(get_settings)):
    return ModelsListResponse(models=settings.AVAILABLE_MODELS)

@router.post("/evaluate", response_model=EvaluationResult)
async def evaluate_models(
    request: PromptRequest,
    settings: Settings = Depends(get_settings)
):
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ API key not configured")
    
    if request.model1 not in settings.AVAILABLE_MODELS:
        raise HTTPException(status_code=400, detail=f"Model 1 '{request.model1}' is not available")
    
    if request.model2 not in settings.AVAILABLE_MODELS:
        raise HTTPException(status_code=400, detail=f"Model 2 '{request.model2}' is not available")
    
    client = groq.Groq(api_key=settings.GROQ_API_KEY)
    
    try:
        # Get responses from both models
        response1 = client.chat.completions.create(
            messages=[{"role": "user", "content": request.prompt}],
            model=request.model1
        )
        
        response2 = client.chat.completions.create(
            messages=[{"role": "user", "content": request.prompt}],
            model=request.model2
        )
        
        response1_text = response1.choices[0].message.content
        response2_text = response2.choices[0].message.content
        
        # Evaluate responses
        winner, reasoning, metrics = evaluate_responses(response1_text, response2_text)
        
        return EvaluationResult(
            model1_response={"model_name": request.model1, "response": response1_text},
            model2_response={"model_name": request.model2, "response": response2_text},
            winner=winner,
            reasoning=reasoning,
            metrics=metrics
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 