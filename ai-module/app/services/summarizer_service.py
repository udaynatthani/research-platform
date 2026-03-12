from transformers import pipeline
from app.core.chunking import chunk_document


class PaperSummarizer:
    """
    Service responsible for generating summaries of research papers.
    """

    def __init__(self):
        self.summarizer = pipeline(
            "summarization",
            model="sshleifer/distilbart-cnn-12-6"
        )

    def summarize_chunks(self, chunks):
        """
        Summarize multiple chunks using batch inference.
        """

        filtered_chunks = [c for c in chunks if len(c.split()) > 40]

        if not filtered_chunks:
            return []

        results = self.summarizer(
            filtered_chunks,
            max_length=130,
            min_length=30,
            do_sample=False,
            truncation=True,
            repetition_penalty=1.2,
            batch_size=4
        )

        return [r["summary_text"] for r in results]

    def summarize_paper(self, paper_text: str) -> str:
        """
        Generate summary for a full research paper.
        """

        chunks = chunk_document(paper_text)

        summaries = self.summarize_chunks(chunks)

        combined_summary = " ".join(summaries)

        return combined_summary