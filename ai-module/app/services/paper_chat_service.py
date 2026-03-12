from app.core.chunking import chunk_document
from app.core.vector_store import VectorStore
from app.models.embedding_model import EmbeddingModel
from app.models.model_registry import ModelRegistry


class PaperChatService:

    def __init__(self):
        self.vector_store = VectorStore()
        self.embedder = EmbeddingModel
        self.generator = ModelRegistry.get_insight_model()

    def index_paper(self, paper_id: str, paper_text: str):
        """
        Index a paper for retrieval, associated with a specific paper_id.
        """

        chunks = chunk_document(paper_text)

        embeddings = self.embedder.embed_batch(chunks)

        metadata = [{"text": chunk, "paper_id": paper_id} for chunk in chunks]

        self.vector_store.add_embeddings(embeddings, metadata)

    def answer_question(self, question: str, paper_id: str = None):
        """
        Answer questions about the indexed paper(s).
        Optional: filter by paper_id.
        """

        query_vector = self.embedder.embed_text(question)

        results = self.vector_store.search(query_vector, k=5, paper_id=paper_id)
        
        if not results:
            return "No relevant information found in the document(s)."

        context = "\n\n".join(
            list({r[1]["text"] for r in results})
        )
        context = context[:2000]

        prompt = f"""
        You are an intelligent AI research assistant.

        Your job is to help a user understand research papers in very simple and clear language.

        CONTEXT FROM THE PAPERS:

        {context}

        -------------------------------------

        USER QUESTION:

        {question}

        -------------------------------------

        Now explain the answer clearly and simply using only the provided context. Answer in 2–4 sentences:
        """

        result = self.generator(
            prompt,
            max_length=128,
            do_sample=False,
            truncation=True
        )

        return result[0]["generated_text"]

# Singleton instance used across the application
paper_chat_service = PaperChatService()