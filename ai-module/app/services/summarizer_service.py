from app.models.model_registry import ModelRegistry
from app.core.chunking import chunk_document


class PaperSummarizer:

    def __init__(self):
        self.summarizer = ModelRegistry.get_summarizer()
        self.generator = ModelRegistry.get_insight_model()

    def summarize_paper(self, paper_text: str) -> dict:
        """
        Generate structured summary for a research paper.
        """
        
        # Get overall summary using BART
        chunks = chunk_document(paper_text)
        overall_summary = self._get_overall_summary(chunks[:3]) # Summarize start of paper

        # Use FLAN-T5 for structured extraction from the introduction/abstract
        context = paper_text[:2000]
        
        contribution = self._extract_field(context, "What is the primary contribution or finding of this paper?")
        methodology = self._extract_field(context, "What research methodology or approach was used?")
        limitations = self._extract_field(context, "What were the main limitations or future work mentioned?")

        return {
            "summary": overall_summary,
            "key_contributions": contribution,
            "methodology": methodology,
            "limitations": limitations
        }

    def _get_overall_summary(self, chunks):
        filtered_chunks = [c for c in chunks if len(c.split()) > 40]
        if not filtered_chunks:
            return ""
            
        results = self.summarizer(
            filtered_chunks,
            max_length=150,
            min_length=40,
            do_sample=False,
            truncation=True
        )
        return " ".join([r["summary_text"] for r in results])

    def _extract_field(self, context, question):
        prompt = f"Context: {context}\n\nQuestion: {question}\n\nAnswer in one concise sentence:"
        result = self.generator(
            prompt,
            max_length=64,
            do_sample=False,
            truncation=True
        )
        return result[0]["generated_text"]