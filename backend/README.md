# Groq Model Evaluator - Backend

This is the backend service for the Groq Model Evaluator, which compares outputs from different Groq API models.

## Setup

1. Create a conda environment:
```bash
conda create -n groq-eval python=3.12.9
conda activate groq-eval
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory with your Groq API key:
```
GROQ_API_KEY=your_api_key_here
```

## Running the Server

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### POST /api/evaluate
Evaluates a prompt using two different Groq models.

Request body:
```json
{
    "prompt": "Your prompt here"
}
```

Response:
```json
{
    "model1_response": {
        "model_name": "llama2-70b",
        "response": "..."
    },
    "model2_response": {
        "model_name": "gemma-7b",
        "response": "..."
    },
    "winner": "Model 1 (llama2-70b)",
    "reasoning": "Explanation of why this model won",
    "metrics": {
        "length_ratio": 0.8,
        "response1_length": 100,
        "response2_length": 80
    }
}
