# AI Government Scheme Recommender Chatbot

An AI-powered Retrieval-Augmented Generation (RAG) chatbot that helps users discover and understand Indian Government schemes through natural language conversations.

The application uses LangChain, ChromaDB, Hugging Face embeddings, Ollama, and FastAPI to retrieve relevant government scheme documents and generate accurate, context-aware responses.

---

## Features

- AI-powered chatbot using RAG
- Natural language question answering
- Semantic document search using ChromaDB
- Conversation history support
- User authentication
- Upload and manage scheme documents
- Automatic vector database generation
- Dockerized deployment
- PostgreSQL database
- Ollama local LLM integration

---

## Tech Stack

### Frontend
- React
- Vite
- Axios

### Backend
- FastAPI
- LangChain
- ChromaDB
- HuggingFace Embeddings
- Ollama
- SQLAlchemy
- PostgreSQL

### AI Models
- Embedding Model
  - sentence-transformers/all-MiniLM-L6-v2

- Large Language Model
  - Qwen2.5:7B (via Ollama)

---

## Project Structure

```
rag_chatbot/
│
├── backend/
│   ├── data/
│   ├── uploads/
│   ├── chroma_db/
│   ├── ingest.py
│   ├── rag.py
│   ├── main.py
│   ├── database.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## Architecture

```
                User
                  │
                  ▼
        React Frontend
                  │
                  ▼
         FastAPI Backend
                  │
      ┌───────────┴───────────┐
      │                       │
      ▼                       ▼
 PostgreSQL              ChromaDB
                              │
                              ▼
                  HuggingFace Embeddings
                              │
                              ▼
                    Government PDFs
                              │
                              ▼
                     Ollama (Qwen2.5:7B)
                              │
                              ▼
                         Final Response
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/theArjunBorkar/RAG-Chatbot.git
cd RAG-Chatbot
```

---

## Running with Docker

Build the containers

```bash
docker compose build
```

Start the application

```bash
docker compose up
```

The services will be available at:

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:8000
```

FastAPI Documentation

```
http://localhost:8000/docs
```

---

## Download the LLM

After starting Docker, download the model into the Ollama container.

```bash
docker compose exec ollama ollama pull qwen2.5:7b
```

Verify installation

```bash
docker compose exec ollama ollama list
```

---

## Build the Vector Database

After placing the government scheme PDFs inside

```
backend/data/
```

run

```bash
docker compose exec backend python ingest.py
```

This creates the Chroma vector database.

---

## Environment Variables

Create a `.env` file inside the backend folder.

Example:

```
DATABASE_URL=postgresql://raguser:password123@postgres:5432/ragchatbot
```

---

## Included Government Schemes

The repository currently contains documents for schemes including:

- Pradhan Mantri Jan Dhan Yojana
- Ayushman Bharat
- Atal Pension Yojana
- Stand Up India
- PM Fasal Bima Yojana
- PM Kaushal Vikas Yojana
- PM Garib Kalyan Package
- Sukanya Samriddhi Yojana
- National Pension System
- Deen Dayal Antyodaya Yojana
- Deen Dayal Upadhyaya Grameen Kaushalya Yojana
- Affordable Rental Housing Complexes

---

## Future Improvements

- Role-based authentication
- Admin dashboard
- Streaming chatbot responses
- Hybrid retrieval (BM25 + Vector Search)
- Citation-based answers
- Multi-language support
- OCR support for scanned PDFs
- Cloud deployment (AWS/Azure)

---

## Authors

**Arjun Borkar**

GitHub: https://github.com/theArjunBorkar

---

## License

This project is intended for educational and research purposes.