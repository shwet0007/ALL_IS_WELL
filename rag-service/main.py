from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Optional
import faiss
import numpy as np
import os
from sentence_transformers import SentenceTransformer
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class QueryRequest(BaseModel):
    query: str
    user_role: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[str]

# Configuration
INDEX_DIR = "data/faiss_index"
INDEX_FILE = os.path.join(INDEX_DIR, "index.faiss")
METADATA_FILE = os.path.join(INDEX_DIR, "metadata.npy")
MODEL_NAME = "all-MiniLM-L6-v2"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global index, metadata, model, groq_client
    
    print("Loading embedding model...")
    model = SentenceTransformer(MODEL_NAME)
    
    print("Loading FAISS index...")
    if os.path.exists(INDEX_FILE) and os.path.exists(METADATA_FILE):
        index = faiss.read_index(INDEX_FILE)
        metadata = np.load(METADATA_FILE, allow_pickle=True).tolist()
        print(f"Index loaded with {index.ntotal} vectors.")
    else:
        print("WARNING: FAISS index not found. RAG queries will fail.")

    if GROQ_API_KEY:
        print("Initializing Groq client...")
        groq_client = Groq(api_key=GROQ_API_KEY)
    else:
        print("WARNING: GROQ_API_KEY not found. LLM generation will be disabled.")
    
    yield
    print("Shutting down RAG service...")

app = FastAPI(title="RAG Medical Awareness Service", version="3.0.0", lifespan=lifespan)

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "rag-medical-awareness",
        "version": "3.0.0",
        "rag_ready": index is not None,
        "llm_ready": groq_client is not None
    }

@app.post("/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    if index is None or model is None:
        raise HTTPException(status_code=503, detail="RAG system not initialized")
    
    # Generate embedding for query
    query_vector = model.encode([request.query])
    
    # Search FAISS index
    k = 3  # Retrieve top 3 chunks
    distances, indices = index.search(np.array(query_vector).astype('float32'), k)
    
    # Retrieve relevant chunks
    retrieved_texts = []
    sources = set()
    
    for idx in indices[0]:
        if idx != -1 and idx < len(metadata):
            item = metadata[idx]
            retrieved_texts.append(item["text"])
            sources.add(item["filename"])
            
    # Formulate response
    if not retrieved_texts:
        return QueryResponse(answer="I couldn't find specific information on that in my database. Please consult a healthcare professional.", sources=[])

    context = "\n---\n".join(retrieved_texts)
    
    # LLM Generation
    if groq_client:
        system_prompt = (
            "You are a medical awareness assistant for the 'Aal is Well' platform.\n"
            "Your goal is to provide helpful, awareness-based guidance to users.\n"
            "STRICT RULES:\n"
            "1. Do NOT provide medical diagnosis or treatment.\n"
            "2. Do NOT recommend specific medication dosages.\n"
            "3. Base your response ONLY on the provided Context. Do not use outside knowledge.\n"
            "4. If the answer is not in the Context, state that you do not have enough information.\n"
            "5. Always recommend consulting a doctor for specific medical advice.\n"
            "6. Tailor your tone to the User Role (pregnant woman, mother, or doctor)."
        )
        
        user_prompt = (
            f"User Role: {request.user_role}\n"
            f"Context:\n{context}\n\n"
            f"User Query: {request.query}\n\n"
            "Answer:"
        )
        
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.1, # Low temperature for groundedness
                max_tokens=300
            )
            final_answer = chat_completion.choices[0].message.content
        except Exception as e:
            print(f"LLM Generation Error: {e}")
            final_answer = "I encountered an issue generating a response. However, here is the relevant information I found:\n\n" + context
    else:
        # Fallback to pure retrieval if LLM is not configured
        role_prefix = f"[Role: {request.user_role}] "
        disclaimer = "\n\n(Note: This is general awareness information and not a medical diagnosis.)"
        final_answer = f"{role_prefix}Based on our guidelines:\n\n{context}{disclaimer}"
    
    return QueryResponse(answer=final_answer, sources=list(sources))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
