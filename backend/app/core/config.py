from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv
from typing import List

load_dotenv()

AVAILABLE_MODELS = [
    "gemma2-9b-it",  # Default model 1
    "llama-3.1-8b-instant",  # Default model 2
    "deepseek-r1-distill-llama-70b",  # Default evaluator
    "qwen-2.5-coder-32b",
    "qwen-qwq-32b",
    "deepseek-r1-distill-qwen-32b",
    "llama-3.2-11b-vision-preview",
    "llama-3.2-1b-preview",
    "llama-3.2-3b-preview"
]

# Models suitable for evaluation (typically larger models)
EVALUATION_MODELS = [
    "deepseek-r1-distill-llama-70b",  # Default evaluator
    "qwen-2.5-coder-32b",
    "llama-3.2-11b-vision-preview"
]

class Settings(BaseSettings):
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    AVAILABLE_MODELS: List[str] = AVAILABLE_MODELS
    EVALUATION_MODELS: List[str] = EVALUATION_MODELS
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings() 