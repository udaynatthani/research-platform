from sentence_transformers import SentenceTransformer


class EmbeddingModel:
    """
    Singleton loader for the embedding model.
    This ensures the model is loaded only once.
    """

    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            cls._model = SentenceTransformer("all-MiniLM-L6-v2")
        return cls._model

    @classmethod
    def embed_text(cls, text: str):
        model = cls.get_model()
        return model.encode(text)

    @classmethod
    def embed_batch(cls, texts: list[str]):
        model = cls.get_model()
        return model.encode(texts)