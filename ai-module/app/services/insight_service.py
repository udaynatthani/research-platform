from transformers import pipeline
from app.core.chunking import chunk_document


class InsightExtractor:
    """
    Service responsible for extracting structured research insights
    from academic papers.
    """

    def __init__(self):
        self.extractor = pipeline(
            "text2text-generation",
            model="google/flan-t5-base"
        )

    def extract_chunk_insights(self, text: str) -> str:
        """
        Extract insights from a single chunk.
        """

        prompt = f"""
Extract the following research information from the text.

Return concise bullet points for:

- Problem Statement
- Research Gap
- Methodology
- Datasets Used
- Evaluation Metrics
- Key Findings

Text:
{text}
"""

        result = self.extractor(
            prompt,
            max_length=256,
            do_sample=False,
            truncation=True
        )

        return result[0]["generated_text"]

    def extract_insights(self, paper_text: str):
        """
        Extract insights from the full research paper.
        """

        chunks = chunk_document(paper_text)

        insights = []

        for chunk in chunks:
            extracted = self.extract_chunk_insights(chunk)
            insights.append(extracted)

        return "\n".join(insights)