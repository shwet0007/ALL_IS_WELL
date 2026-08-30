import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Configuration
DATA_DIR = "data/medical_docs"
INDEX_DIR = "data/faiss_index"
INDEX_FILE = os.path.join(INDEX_DIR, "index.faiss")
METADATA_FILE = os.path.join(INDEX_DIR, "metadata.npy")
MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_SIZE = 500  # Characters (approx) - simple splitting for now

def load_documents(data_dir):
    """Loads text files from the data directory."""
    documents = []
    if not os.path.exists(data_dir):
        print(f"Directory not found: {data_dir}")
        return documents
        
    for filename in os.listdir(data_dir):
        if filename.endswith(".txt"):
            filepath = os.path.join(data_dir, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                text = f.read()
                documents.append({"filename": filename, "text": text})
    return documents

def chunk_text(text, chunk_size=500):
    """Splits text into smaller chunks."""
    # Simple character-based splitting with overlap could be better, 
    # but starting with paragraph/sentence aware splitting is ideal.
    # For this task, we'll split by paragraphs effectively.
    chunks = []
    paragraphs = text.split('\n\n')
    
    current_chunk = ""
    for para in paragraphs:
        if len(current_chunk) + len(para) < chunk_size:
            current_chunk += para + "\n\n"
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = para + "\n\n"
    
    if current_chunk:
        chunks.append(current_chunk.strip())
        
    return chunks

def main():
    print("Loading embedding model...")
    model = SentenceTransformer(MODEL_NAME)
    
    print(f"Loading documents from {DATA_DIR}...")
    docs = load_documents(DATA_DIR)
    
    all_chunks = []
    all_metadata = []
    
    print("Chunking documents...")
    for doc in docs:
        chunks = chunk_text(doc["text"], CHUNK_SIZE)
        for chunk in chunks:
            all_chunks.append(chunk)
            all_metadata.append({"filename": doc["filename"], "text": chunk})
            
    if not all_chunks:
        print("No documents found or empty documents.")
        return

    print(f"Generated {len(all_chunks)} chunks. Creating embeddings...")
    embeddings = model.encode(all_chunks)
    
    # Create FAISS index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings).astype('float32'))
    
    # Save index and metadata
    if not os.path.exists(INDEX_DIR):
        os.makedirs(INDEX_DIR)
        
    print(f"Saving index to {INDEX_FILE}...")
    faiss.write_index(index, INDEX_FILE)
    
    print(f"Saving metadata to {METADATA_FILE}...")
    np.save(METADATA_FILE, all_metadata)
    
    print("Ingestion complete!")

if __name__ == "__main__":
    main()
