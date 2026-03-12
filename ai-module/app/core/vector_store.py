import faiss
import numpy as np
from typing import List, Tuple


class VectorStore:
    """
    Simple FAISS-based vector store for semantic search.
    Stores embeddings and associated metadata.
    """

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.metadata = []

    def add_embeddings(self, embeddings: List[List[float]], metadata: List[dict]):
        """
        Add embeddings and their metadata to the vector store.
        """
        vectors = np.array(embeddings).astype("float32")
        self.index.add(vectors)

        self.metadata.extend(metadata)

    def search(self, query_vector: List[float], k: int = 5) -> List[Tuple[float, dict]]:
        """
        Search for the top-k similar vectors.
        Returns (distance, metadata)
        """

        query = np.array([query_vector]).astype("float32")

        distances, indices = self.index.search(query, k)

        results = []

        for distance, idx in zip(distances[0], indices[0]):
            if idx < len(self.metadata):
                results.append((distance, self.metadata[idx]))

        return results