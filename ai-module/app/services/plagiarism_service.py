from sklearn.metrics.pairwise import cosine_similarity

from app.core.chunking import chunk_document
from app.models.embedding_model import EmbeddingModel


class PlagiarismService:

    def __init__(self):
        self.embedder = EmbeddingModel

    def check_plagiarism(self, paper_a: str, paper_b: str):
        """
        Compare two papers and return similarity score.
        """

        chunks_a = chunk_document(paper_a)
        chunks_b = chunk_document(paper_b)

        embeddings_a = self.embedder.embed_batch(chunks_a)
        embeddings_b = self.embedder.embed_batch(chunks_b)

        similarity_matrix = cosine_similarity(embeddings_a, embeddings_b)

        max_similarities = similarity_matrix.max(axis=1)

        plagiarism_score = float(max_similarities.mean())

        matches = []

        for i, score in enumerate(max_similarities):
            if score > 0.85:
                matches.append({
                    "text": chunks_a[i],
                    "similarity": float(score)
                })

        return {
            "plagiarism_score": plagiarism_score,
            "matching_sections": matches[:5]
        }