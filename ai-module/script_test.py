from app.models.embedding_model import EmbeddingModel

vector = EmbeddingModel.embed_text("Graph neural networks")

print(len(vector))