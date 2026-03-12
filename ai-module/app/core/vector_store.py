import faiss
import numpy as np
import os
import pickle
from typing import List, Tuple


class VectorStore:
    """
    Simple FAISS-based vector store for semantic search.
    Stores embeddings and associated metadata with persistence support.
    """

    def __init__(self, dimension: int = 384, persist_dir: str = "storage"):
        self.dimension = dimension
        self.persist_dir = persist_dir
        self.index_path = os.path.join(persist_dir, "index.faiss")
        self.metadata_path = os.path.join(persist_dir, "metadata.pkl")
        
        if not os.path.exists(persist_dir):
            os.makedirs(persist_dir)

        self.index = faiss.IndexFlatL2(dimension)
        self.metadata = []
        
        # Load existing index if available
        self.load()

    def add_embeddings(self, embeddings: List[List[float]], metadata: List[dict]):
        """
        Add embeddings and their metadata to the vector store.
        """
        vectors = np.array(embeddings).astype("float32")
        self.index.add(vectors)
        self.metadata.extend(metadata)
        self.save()

    def search(self, query_vector: List[float], k: int = 5, paper_id: str = None) -> List[Tuple[float, dict]]:
        """
        Search for the top-k similar vectors.
        Optionally filter by paper_id in metadata.
        """
        query = np.array([query_vector]).astype("float32")
        
        # If we have paper_id, we search more and filter manually (since FlatL2 doesn't native filter well)
        # For a hackathon/research tool, this is acceptable for small/medium datasets
        search_k = k * 10 if paper_id else k
        distances, indices = self.index.search(query, search_k)

        results = []
        for d, idx in zip(distances[0], indices[0]):
            if idx == -1 or idx >= len(self.metadata):
                continue
            
            meta = self.metadata[idx]
            if paper_id and meta.get("paper_id") != paper_id:
                continue
                
            results.append((float(d), meta))
            if len(results) >= k:
                break

        return results

    def save(self):
        """Save index and metadata to disk."""
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, "wb") as f:
            pickle.dump(self.metadata, f)

    def load(self):
        """Load index and metadata from disk."""
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.metadata_path, "rb") as f:
                    self.metadata = pickle.load(f)
            except Exception as e:
                print(f"Error loading vector store: {e}")
                self.index = faiss.IndexFlatL2(self.dimension)
                self.metadata = []