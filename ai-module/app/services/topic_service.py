from typing import List
import re
from collections import Counter


class TopicService:
    """
    Simple service for extracting research topics and keywords.
    For a production system, this could use KeyBERT or LDA.
    """

    def __init__(self):
        # List of common research stop words
        self.stop_words = {
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "of", "from",
            "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
            "this", "that", "these", "those", "i", "we", "you", "he", "she", "it", "they", "we", "research",
            "paper", "study", "analysis", "using", "used", "results", "based", "proposed", "method", "approach"
        }

    def extract_topics(self, text: str, top_k: int = 5) -> List[str]:
        """
        Extract the most frequent meaningful keywords from the text.
        """
        # Clean text
        text = text.lower()
        words = re.findall(r'\b[a-z]{4,}\b', text) # Only words with 4+ characters
        
        # Filter stop words
        meaningful_words = [w for w in words if w not in self.stop_words]
        
        # Count frequencies
        counts = Counter(meaningful_words)
        
        # Return top K
        return [word for word, count in counts.most_common(top_k)]

topic_service = TopicService()
