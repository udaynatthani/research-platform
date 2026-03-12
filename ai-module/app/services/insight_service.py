from app.models.model_registry import ModelRegistry
from app.core.chunking import chunk_document


class InsightExtractor:

    def __init__(self):
        self.extractor = ModelRegistry.get_insight_model()

    def extract_insights(self, paper_text: str) -> str:
        """
        Extract key research insights from relevant parts of the paper.
        Focuses on the introduction/abstract (first 2000 chars) for high density of insights.
        """
        
        # Only process the first part to keep things snappy and accurate
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

        return result[0]["generated_text"]