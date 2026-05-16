from google import genai
from google.genai import types
from app.schemas.agents import IntakeClassification
from app.core.guardrails import check_guardrails

class GuardrailException(Exception):
    def __init__(self, reason: str):
        self.reason = reason
        super().__init__(f"Guardrail check failed: {reason}")

def analyze_input(client: genai.Client, user_input: str, model: str = "gemini-2.5-flash") -> IntakeClassification:
    # 1. Run guardrails
    guardrail_result = check_guardrails(client, user_input, model)
    if not guardrail_result.is_safe:
        raise GuardrailException(guardrail_result.reason)
        
    # 2. Classify input
    prompt = f"""
    You are the Intake Agent for an AI Operations Center.
    Analyze the user input and extract the intent, domain, and any relevant entities (e.g., product names, cities like Karachi, numbers).
    
    User Input: "{user_input}"
    """
    
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=IntakeClassification,
            temperature=0.0
        ),
    )
    
    return IntakeClassification.model_validate_json(response.text)
