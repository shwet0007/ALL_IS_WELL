# RAG Medical Awareness Service

A standalone Python microservice providing RAG-based medical awareness guidance for the "Aal is Well" platform.

## 🎯 Purpose

This service provides **awareness-based medical guidance** using Retrieval-Augmented Generation (RAG). It does NOT provide medical diagnosis or treatment recommendations.

## ⚡ Quick Start

### Installation

```bash
cd rag-service
pip install -r requirements.txt
```

### Run Service

```bash
python main.py
```

The service will start on **http://localhost:9000**

## 📡 API Endpoints

### Health Check
```
GET /
```

**Response:**
```json
{
  "status": "healthy",
  "service": "rag-medical-awareness",
  "version": "1.0.0",
  "timestamp": "2026-01-23T08:00:00"
}
```

### Query RAG System
```
POST /query
```

**Request Body:**
```json
{
  "query": "What foods should I eat during pregnancy?",
  "user_role": "pregnant"
}
```

**User Roles:**
- `pregnant` - Pregnant women
- `mother` - Mothers with infants/children
- `doctor` - Healthcare providers

**Response:**
```json
{
  "answer": "During pregnancy, focus on eating a balanced diet...",
  "sources": ["pregnancy_nutrition_guide.pdf", "prenatal_care_handbook.pdf"]
}
```

## 🧪 Testing

### Using cURL

```bash
# Health check
curl http://localhost:9000/

# Query for pregnant user
curl -X POST http://localhost:9000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What should I eat?", "user_role": "pregnant"}'

# Query for mother user
curl -X POST http://localhost:9000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How often should baby eat?", "user_role": "mother"}'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:9000/query",
    json={
        "query": "What exercises are safe during pregnancy?",
        "user_role": "pregnant"
    }
)
print(response.json())
```

## 🏗️ Current Status

**Version:** 1.0.0 (Mock Implementation)

- ✅ FastAPI service running on port 9000
- ✅ POST /query endpoint with role-based responses
- ✅ Mock RAG responses with keyword matching
- ✅ CORS enabled for frontend integration
- ⏳ **No LLM integration yet** (coming in future versions)
- ⏳ **No vector database** (coming in future versions)

## 🔐 Important Notes

### Disclaimer
This service provides **awareness guidance only**. It is NOT:
- ❌ A medical diagnosis tool
- ❌ A replacement for professional medical advice
- ❌ A treatment recommendation system

### Future Enhancements
- Real RAG implementation with vector database (ChromaDB/Pinecone)
- Integration with LLM (Groq/OpenAI)
- Document ingestion pipeline
- Citation tracking
- Answer quality scoring

## 📂 Service Structure

```
rag-service/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## 🔗 Integration

This service is designed to be called by the backend Express server or directly from the frontend. Add the following to your backend `.env`:

```env
RAG_SERVICE_URL=http://localhost:9000
```

## 📝 Example Queries by Role

### Pregnant Women
- "What foods should I eat during pregnancy?"
- "Is exercise safe during pregnancy?"
- "What vitamins do I need?"

### Mothers
- "How often should my baby eat?"
- "When should my baby sleep?"
- "How many diapers per day is normal?"

### Doctors
- "What are the patient education protocols?"
- "How to document maternal care?"

## 🚀 Development

The service uses FastAPI's auto-reload feature. Changes to `main.py` will automatically restart the server.

### API Documentation

Once running, visit:
- Swagger UI: http://localhost:9000/docs
- ReDoc: http://localhost:9000/redoc
