from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import PromptRequest, EvaluationResult, ModelsListResponse, ApiKeyRequest
from app.core.config import get_settings, Settings
from app.core.evaluator import ModelEvaluator
import groq
from fastapi.responses import JSONResponse

router = APIRouter()
user_api_key = None

@router.post("/set-key")
async def set_api_key(request: ApiKeyRequest):
    global user_api_key
    try:
        # Test the API key with a simpler model
        client = groq.Groq(api_key=request.api_key)
        # Try a simple completion to verify the key works
        client.chat.completions.create(
            messages=[{"role": "user", "content": "test"}],
            model="llama-3.1-8b-instant",  # Using a more reliable model
            max_tokens=1
        )
        user_api_key = request.api_key
        return JSONResponse(content={"message": "API key set successfully"})
    except Exception as e:
        # Log the actual error for debugging
        print(f"API Key validation error: {str(e)}")
        if "401" in str(e):
            raise HTTPException(status_code=401, detail="Invalid API key")
        elif "429" in str(e):
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")
        else:
            raise HTTPException(status_code=400, detail=f"API key validation failed: {str(e)}")

@router.get("/models", response_model=ModelsListResponse)
async def get_available_models(settings: Settings = Depends(get_settings)):
    return ModelsListResponse(
        models=settings.AVAILABLE_MODELS,
        evaluation_models=settings.EVALUATION_MODELS
    )

@router.post("/evaluate", response_model=EvaluationResult)
async def evaluate_models(
    request: PromptRequest,
    settings: Settings = Depends(get_settings)
):
    global user_api_key
    if not user_api_key:
        raise HTTPException(status_code=401, detail="Please set your API key first")
    
    if request.model1 not in settings.AVAILABLE_MODELS:
        raise HTTPException(status_code=400, detail=f"Model 1 '{request.model1}' is not available")
    
    if request.model2 not in settings.AVAILABLE_MODELS:
        raise HTTPException(status_code=400, detail=f"Model 2 '{request.model2}' is not available")
        
    if request.evaluator_model not in settings.EVALUATION_MODELS:
        raise HTTPException(status_code=400, detail=f"Evaluator model '{request.evaluator_model}' is not available")
    
    client = groq.Groq(api_key=user_api_key)
    evaluator = ModelEvaluator(user_api_key)
    
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
        
        # Evaluate responses using the selected model
        evaluation_result = evaluator.evaluate_responses(
            prompt=request.prompt,
            response1=response1_text,
            response2=response2_text,
            model1_name=request.model1,
            model2_name=request.model2,
            evaluator_model=request.evaluator_model
        )
        
        return EvaluationResult(
            model1_response={"model_name": request.model1, "response": response1_text},
            model2_response={"model_name": request.model2, "response": response2_text},
            winner=evaluation_result["winner"],
            reasoning=evaluation_result["reasoning"],
            metrics=evaluation_result["metrics"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 