from app.models.model_registry import ModelRegistry
from app.core.chunking import chunk_document


class InsightExtractor:

    def __init__(self):
        self.extractor = ModelRegistry.get_insight_model()

    def extract_insights(self, paper_text: str) -> dict:
        """
        Extract key research insights and calculate a confidence score.
        """
        
        context = paper_text[:2500]

        prompt = f"""
        Extract the following research information based ONLY on the provided text.
        
        TEXT:
        {context}
        
        Provide concise research highlights covering:
        - Main problem being solved
        - Key methodology or approach
        - Primary findings or results
        - Research gap identified
        
        Answer with 3-5 clear bullet points.
        """

        result = self.extractor(
            prompt,
            max_length=256,
            do_sample=False,
            truncation=True
        )

        insights_text = result[0]["generated_text"]
        
        # Simple heuristic for confidence score: 
        # Boost based on length and presence of expected bullet structure
        score = 0.7  # Base confidence
        if len(insights_text.split()) > 30: score += 0.15
        if "-" in insights_text: score += 0.1
        
        return {
            "insights": insights_text,
            "confidence_score": min(score, 0.98) # Cap at 98%
        }