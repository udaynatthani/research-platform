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

    def summarize_chunk(self, text: str) -> str:
        """
        Summarize a single chunk of text.
        """

        result = self.summarizer(
            text,
            max_length=130,
            min_length=40,
            do_sample=False
        )

        return result[0]["summary_text"]

    def summarize_paper(self, paper_text: str) -> str:
        """
        Generate summary for a full research paper.
        """

        chunks = chunk_document(paper_text)

        partial_summaries = []

        for chunk in chunks:
            summary = self.summarize_chunk(chunk)
            partial_summaries.append(summary)

        combined_summary = " ".join(partial_summaries)

        return combined_summary