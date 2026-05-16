from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class IntakeClassification(BaseModel):
    domain: str = Field(..., description="The domain of the input (e.g., 'sales', 'inventory', 'marketing', 'general')")
    intent: str = Field(..., description="The inferred intent of the user (e.g., 'analyze_sales', 'reduce_price', 'informational')")
    confidence: float = Field(..., description="Confidence score from 0.0 to 1.0")
    extracted_entities: Dict[str, Any] = Field(default_factory=dict, description="Any specific entities extracted like locations, product names, or metrics.")

class InsightResult(BaseModel):
    summary: str = Field(..., description="A brief summary of the merged data and user request.")
    anomalies_detected: List[str] = Field(default_factory=list, description="Any detected anomalies such as sudden drop in sales or low stock.")
    trends: List[str] = Field(default_factory=list, description="Any observed trends.")
    actionable_insights: List[str] = Field(default_factory=list, description="Specific insights that require business action.")

class DecisionAction(BaseModel):
    action_type: str = Field(..., description="The type of action to take (e.g., 'create_campaign', 'update_price', 'reorder_stock', 'no_action')")
    details: Dict[str, Any] = Field(..., description="The exact parameters needed for the action. For create_campaign: name, discount_percent, region. For update_price: product_id, new_price.")
    justification: str = Field(..., description="Why this action was chosen based on the insights.")
