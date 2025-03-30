from pydantic import BaseModel
from typing import Optional, List

class PromptRequest(BaseModel):
    prompt: str
    model1: str
    model2: str
    
class ModelResponse(BaseModel):
    model_name: str
    response: str
    
class EvaluationResult(BaseModel):
    model1_response: ModelResponse
    model2_response: ModelResponse
    winner: str
    reasoning: str
    metrics: dict[str, float]

class ModelsListResponse(BaseModel):
    models: List[str] 