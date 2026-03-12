from collections import defaultdict

from app.models.embedding_model import EmbeddingModel
from app.services.paper_chat_service import paper_chat_service
from app.core.chunking import chunk_document


class RecommendationService:

    def __init__(self):
        self.embedder = EmbeddingModel
        self.vector_store = paper_chat_service.vector_store

    def recommend_papers(self, paper_text: str, top_k: int = 5):
        """
        Recommend similar research papers based on semantic similarity.
        """

        chunks = chunk_document(paper_text)

        embeddings = self.embedder.embed_batch(chunks)

        paper_scores = defaultdict(list)
        paper_metadata = {}

        for emb in embeddings:

            results = self.vector_store.search(emb, k=10)

            for distance, metadata in results:

                similarity = float(max(0, 1 / (1 + distance)))
                paper_id = metadata.get("paper_id")
                title = metadata.get("title", "Unknown")
                text_preview = metadata.get("text", "")[:200]

                if not paper_id:
                    # If no paper_id in metadata, use text hash as fallback
                    paper_id = str(hash(metadata.get("text", "")))

                paper_scores[paper_id].append(similarity)
                paper_metadata[paper_id] = {
                    "paper_id": paper_id,
                    "title": title,
                    "text_preview": text_preview
                }

        recommendations = []

        for paper_id, scores in paper_scores.items():

            avg_score = sum(scores) / len(scores)

            meta = paper_metadata[paper_id]

            recommendations.append({
                "paper_id": paper_id,
                "title": meta.get("title"),
                "text_preview": meta.get("text_preview"),
                "similarity_score": float(avg_score)
            })

        recommendations.sort(
            key=lambda x: x["similarity_score"],
            reverse=True
        )

        return recommendations[:top_k]