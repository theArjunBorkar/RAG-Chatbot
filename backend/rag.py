from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain_ollama import ChatOllama
import os

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vectordb = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embedding_model
)

OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434"
)

llm = ChatOllama(
    model="qwen2.5:7b",
    base_url=OLLAMA_URL
)

def ask_rag(query, history_context=""):

    docs = vectordb.similarity_search(query, k=6)

    if not docs:
        return "No relevant information found."

    context = "\n\n".join([
        doc.page_content for doc in docs
    ])

    prompt = f"""
You are an expert AI assistant for Indian government schemes.

Previous conversation:

{history_context}

Relevant scheme documents:

{context}

Current Question:

{query}

Answer naturally while considering both:
1. Previous conversation
2. Retrieved documents

Do not use Markdown syntax.
Do not use # or * characters.
Use only plain text.
"""

    response = llm.invoke(prompt)

    return str(response.content)