from transformers import pipeline


class ModelRegistry:
    """
    Central registry for loading and reusing AI models.
    Ensures models are loaded only once.
    """

    _summarizer = None
    _insight_model = None

    @classmethod
    def get_summarizer(cls):
        if cls._summarizer is None:
            cls._summarizer = pipeline(
                "summarization",
                model="sshleifer/distilbart-cnn-12-6"
            )
        return cls._summarizer

    @classmethod
    def get_insight_model(cls):
        if cls._insight_model is None:
            cls._insight_model = pipeline(
                "text2text-generation",
                model="google/flan-t5-base"
            )
        return cls._insight_model