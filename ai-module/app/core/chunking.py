from typing import List


class TextChunker:
    """
    Utility class for splitting large text into smaller chunks
    suitable for embeddings and LLM processing.
    """

    def __init__(self, chunk_size: int = 500, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into overlapping chunks.
        """
        words = text.split()
        chunks = []

        start = 0
        text_length = len(words)

        while start < text_length:
            end = start + self.chunk_size
            chunk_words = words[start:end]

            chunk = " ".join(chunk_words)
            chunks.append(chunk)

            start += self.chunk_size - self.overlap

        return chunks


def chunk_document(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Convenience function for chunking documents.
    """
    chunker = TextChunker(chunk_size, overlap)
    return chunker.chunk_text(text)