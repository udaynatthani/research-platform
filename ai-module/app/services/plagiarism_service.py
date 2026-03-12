from app.core.chunking import chunk_document
from app.models.embedding_model import EmbeddingModel
from app.services.paper_chat_service import paper_chat_service


class PlagiarismService:

    def __init__(self):
        self.embedder = EmbeddingModel
        self.vector_store = paper_chat_service.vector_store

    def check_plagiarism(self, paper: str):

        chunks = chunk_document(paper)

        embeddings = self.embedder.embed_batch(chunks)

        matches = []
        similarity_scores = []

        for i, emb in enumerate(embeddings):

            results = self.vector_store.search(emb, k=3)

            for distance, metadata in results:

                similarity = 1 - distance

                similarity_scores.append(similarity)

                if similarity > 0.85:

                    matches.append({
                        "text": chunks[i],
                        "matched_text": metadata["text"],
                        "similarity": float(similarity)
                    })

        if len(similarity_scores) == 0:
            plagiarism_score = 0.0
        else:
            plagiarism_score = float(sum(similarity_scores) / len(similarity_scores))

        return {
            "plagiarism_score": plagiarism_score,
            "matching_sections": matches[:5]
        }