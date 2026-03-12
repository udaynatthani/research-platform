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

                similarity = 1 - distance
                paper_id = metadata.get("paper_id")

                if not paper_id:
                    continue

                paper_scores[paper_id].append(similarity)
                paper_metadata[paper_id] = metadata

        recommendations = []

        for paper_id, scores in paper_scores.items():

            avg_score = sum(scores) / len(scores)

            meta = paper_metadata[paper_id]

            recommendations.append({
                "paper_id": paper_id,
                "title": meta.get("title"),
                "similarity_score": float(avg_score)
            })

        recommendations.sort(
            key=lambda x: x["similarity_score"],
            reverse=True
        )

        return recommendations[:top_k]