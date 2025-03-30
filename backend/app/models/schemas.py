from pydantic import BaseModel
from typing import Optional

class PromptRequest(BaseModel):
    prompt: str
    
class ModelResponse(BaseModel):
    model_name: str
    response: str
    
class EvaluationResult(BaseModel):
    model1_response: ModelResponse
    model2_response: ModelResponse
    winner: str
    reasoning: str
    metrics: dict[str, float] 