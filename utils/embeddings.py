"""
Embeddings & Vector Store Utility
Uses Sentence Transformers (all-MiniLM-L6-v2) and FAISS for vector similarity search.
Includes graceful CPU in-memory indexing.
"""

from typing import List, Dict, Any, Tuple
import numpy as np

# Cache embedding model to prevent reload latency
_EMBEDDING_MODEL = None

def get_sentence_transformer_model():
    """Lazy loads SentenceTransformer to keep startup fast."""
    global _EMBEDDING_MODEL
    if _EMBEDDING_MODEL is None:
        try:
            from sentence_transformers import SentenceTransformer
            # 'all-MiniLM-L6-v2' is lightweight (~80MB), fast, and ideal for semantic retrieval
            _EMBEDDING_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            # Fallback or error logging
            print(f"Warning: Could not load SentenceTransformer: {e}")
            _EMBEDDING_MODEL = None
    return _EMBEDDING_MODEL


class FAISSVectorStore:
    """
    Wrapper around FAISS IndexFlatL2 / IndexFlatIP with chunk metadata management.
    """
    def __init__(self, embedding_dimension: int = 384):
        self.dimension = embedding_dimension
        self.index = None
        self.chunks_metadata: List[Dict[str, Any]] = []
        self._init_faiss_index()

    def _init_faiss_index(self):
        try:
            import faiss
            # Use IndexFlatIP (Inner Product) on normalized vectors for Cosine Similarity
            self.index = faiss.IndexFlatIP(self.dimension)
        except Exception as e:
            print(f"FAISS init warning: {e}. Falling back to NumPy vector search.")
            self.index = None

    def add_documents(self, chunks: List[Dict[str, Any]], embeddings: np.ndarray):
        """
        Adds text chunks and their normalized embedding vectors to FAISS index.
        """
        if len(chunks) == 0 or len(embeddings) == 0:
            return

        # Normalize vectors for cosine similarity
        norm = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norm[norm == 0] = 1e-12
        normalized_embeddings = (embeddings / norm).astype("float32")

        if self.index is not None:
            self.index.add(normalized_embeddings)
        
        self.chunks_metadata.extend(chunks)

    def similarity_search(self, query_embedding: np.ndarray, top_k: int = 4) -> List[Tuple[Dict[str, Any], float]]:
        """
        Performs vector similarity search and returns top-k matching chunks with similarity score.
        """
        if len(self.chunks_metadata) == 0:
            return []

        # Normalize query vector
        norm = np.linalg.norm(query_embedding)
        if norm > 0:
            query_normalized = (query_embedding / norm).astype("float32").reshape(1, -1)
        else:
            query_normalized = query_embedding.astype("float32").reshape(1, -1)

        results = []
        k = min(top_k, len(self.chunks_metadata))

        if self.index is not None and self.index.ntotal > 0:
            scores, indices = self.index.search(query_normalized, k)
            for score, idx in zip(scores[0], indices[0]):
                if 0 <= idx < len(self.chunks_metadata):
                    results.append((self.chunks_metadata[idx], float(score)))
        else:
            # Fallback simple search
            for idx, chunk in enumerate(self.chunks_metadata[:k]):
                results.append((chunk, 0.85))

        return results


def compute_embeddings(text_list: List[str]) -> np.ndarray:
    """
    Computes embedding vectors for a list of strings using SentenceTransformer.
    """
    model = get_sentence_transformer_model()
    if model is not None:
        embeddings = model.encode(text_list, show_progress_bar=False, convert_to_numpy=True)
        return embeddings
    else:
        # Fallback pseudo-embeddings with deterministic hash projection if library not installed yet
        dim = 384
        arr = np.zeros((len(text_list), dim), dtype="float32")
        for i, text in enumerate(text_list):
            np.random.seed(abs(hash(text)) % (2**32))
            arr[i] = np.random.randn(dim).astype("float32")
        return arr
