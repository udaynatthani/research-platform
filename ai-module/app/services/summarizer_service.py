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

        word_count = len(text.split())

        # Dynamically adjust summary size
        max_len = min(130, max(30, word_count // 2))
        min_len = min(40, max(10, word_count // 4))

        result = self.summarizer(
            text,
            max_length=max_len,
            min_length=min_len,
            do_sample=False,
            truncation=True,
            repetition_penalty=1.2
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