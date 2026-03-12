from app.core.chunking import chunk_document
from app.core.vector_store import VectorStore
from app.models.embedding_model import EmbeddingModel
from app.models.model_registry import ModelRegistry


class PaperChatService:

    def __init__(self):
        self.vector_store = VectorStore()
        self.embedder = EmbeddingModel
        self.generator = ModelRegistry.get_insight_model()

    def index_paper(self, paper_text: str):
        """
        Index a paper for retrieval.
        """

        chunks = chunk_document(paper_text)

        embeddings = self.embedder.embed_batch(chunks)

        metadata = [{"text": chunk} for chunk in chunks]

        self.vector_store.add_embeddings(embeddings, metadata)

    def answer_question(self, question: str):
        """
        Answer questions about the indexed paper.
        """

        query_vector = self.embedder.embed_text(question)

        results = self.vector_store.search(query_vector, k=5)
        context = "\n\n".join(
            list({r[1]["text"] for r in results})
        )
        context = context[:2000]

        prompt = f"""
        You are an intelligent AI research assistant.

        Your job is to help a user understand a research paper in very simple and clear language.

        The user might not be an expert, so you must explain things in an easy-to-understand way, like explaining to a beginner or a curious student.

        IMPORTANT RULES:

        1. Use ONLY the information provided in the context below.
        2. Do NOT invent information that is not present in the context.
        3. If the context does not contain the answer, say:
           "The paper does not provide this information."
        4. Use simple and clear language.
        5. Avoid technical jargon when possible.
        6. If technical terms appear in the context, briefly explain them.
        7. Answer in 2–4 sentences maximum.
        8. Focus on the main idea rather than copying sentences from the context.

        Your explanation should feel like a teacher explaining a concept to a beginner.

        -------------------------------------

        CONTEXT FROM THE PAPER:

        {context}

        -------------------------------------

        USER QUESTION:

        {question}

        -------------------------------------

        Now explain the answer clearly and simply:
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