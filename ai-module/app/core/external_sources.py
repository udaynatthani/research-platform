from sklearn.metrics.pairwise import cosine_similarity

from app.core.chunking import chunk_document
from app.models.embedding_model import EmbeddingModel
from app.services.paper_chat_service import paper_chat_service
from app.core.external_sources import fetch_external_sources


class PlagiarismService:

    def __init__(self):
        self.embedder = EmbeddingModel
        self.vector_store = paper_chat_service.vector_store

    def check_plagiarism(self, paper: str):

        chunks = chunk_document(paper)

        embeddings = self.embedder.embed_batch(chunks)

        matches = []
        similarity_scores = []

        for i, chunk in enumerate(chunks):

            emb = embeddings[i]

            # INTERNAL SEARCH
            results = self.vector_store.search(emb, k=3)

            for distance, metadata in results:

                similarity = 1 - distance
                similarity_scores.append(similarity)

                if similarity > 0.85:

                    matches.append({
                        "input_text": chunk,
                        "matched_text": metadata["text"],
                        "source": "internal_database",
                        "similarity": float(similarity)
                    })

            # EXTERNAL SEARCH
            external_docs = fetch_external_sources(chunk[:200])

            if external_docs:

                ext_embeddings = self.embedder.embed_batch(external_docs)

                sims = cosine_similarity([emb], ext_embeddings)[0]

                for j, score in enumerate(sims):

                    similarity_scores.append(score)

                    if score > 0.85:

                        matches.append({
                            "input_text": chunk,
                            "matched_text": external_docs[j],
                            "source": "external_academic",
                            "similarity": float(score)
                        })

        plagiarism_score = 0.0

        if similarity_scores:
            plagiarism_score = float(sum(similarity_scores) / len(similarity_scores))

        return {
            "plagiarism_score": plagiarism_score,
            "matching_sections": matches[:5]
        }