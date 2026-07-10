from database import Base, engine, SessionLocal, get_db
import models
from models import User, ChatHistory, ChatSession

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from rag import ask_rag

import shutil
import json
import os

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

from transformers import pipeline
from pydantic import BaseModel, EmailStr, field_validator
import re

# class UserAuth(BaseModel):
#     email: str
#     password: str

class UserAuth(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):

        if len(value) < 8:
            raise ValueError(
                "Password must be at least 8 characters long"
            )

        if not re.search(r"[A-Z]", value):
            raise ValueError(
                "Password must contain an uppercase letter"
            )

        if not re.search(r"[a-z]", value):
            raise ValueError(
                "Password must contain a lowercase letter"
            )

        if not re.search(r"\d", value):
            raise ValueError(
                "Password must contain a number"
            )

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError(
                "Password must contain a special character"
            )

        return value

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

USERS_FILE = "users.json"

if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, "w") as f:
        json.dump([], f)

class UserRequest(BaseModel):
    email: str
    password: str

users = []

@app.post("/signup")
def signup(user: UserAuth, db: Session = Depends(get_db)):

    if not user.email.strip():
        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )

    if not user.password.strip():
        raise HTTPException(
            status_code=400,
            detail="Password is required"
        )

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    hashed_password = pwd_context.hash(user.password)

    new_user = User(
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "Signup successful"
    }

@app.post("/login")
def login(user: UserAuth, db: Session = Depends(get_db)):

    if not user.email.strip():
        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )

    if not user.password.strip():
        raise HTTPException(
            status_code=400,
            detail="Password is required"
        )

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="User does not exist"
        )

    if not pwd_context.verify(user.password, existing_user.password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )

    return {
        "message": "Login successful",
        "user_id": existing_user.id
    }

# ---------------- FOLDERS ----------------

UPLOAD_FOLDER = "uploads"
DB_FOLDER = "chroma_db"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DB_FOLDER, exist_ok=True)

# ---------------- EMBEDDINGS ----------------

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# ---------------- VECTOR DB ----------------

vectordb = Chroma(
    persist_directory=DB_FOLDER,
    embedding_function=embedding_model
)

# ---------------- SUMMARIZER ----------------

summarizer = pipeline(
    "text2text-generation",
    model="google/flan-t5-base"
)

# ---------------- ROOT ----------------

@app.get("/")
def home():
    return {
        "message": "Backend running"
    }

# ---------------- PDF UPLOAD ----------------

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    file_path = f"{UPLOAD_FOLDER}/{file.filename}"

    # save pdf
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # load pdf
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    # split text
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    docs = splitter.split_documents(documents)
    texts = []
    metadatas = []

    # summarize chunks
    for doc in docs:
        text = doc.page_content

        if len(text.strip()) < 50:
            continue
        try:
            summary = summarizer(
                f"Summarize this:\n{text}",
                max_length=120,
                do_sample=False
            )[0]["generated_text"]
        except:
            summary = text[:300]

        texts.append(summary)
        metadatas.append({
            "source": file.filename
        })

    # store in vector db
    vectordb.add_texts(
        texts=texts,
        metadatas=metadatas
    )

    return {
        "message": f"{file.filename} uploaded and indexed successfully",
        "chunks_added": len(texts)
    }

# ---------------- GET VECTOR DATA ----------------

@app.get("/vectors")
def get_vectors():
    data = vectordb.get()
    return {
        "documents": data["documents"]
    }

# ---------------- QUERY RAG & CHAT HISTORY ----------------

@app.post("/new_chat")
def new_chat(data: dict, db: Session = Depends(get_db)):

    chat = ChatSession(
        title=data["title"],
        user_id=data["user_id"]
    )

    db.add(chat)
    db.commit()
    db.refresh(chat)

    # return chat
    return {
        "session_id": chat.id
    }

@app.delete("/delete_chat/{session_id}")
def delete_chat(
    session_id: int,
    db: Session = Depends(get_db)
):

    # delete all messages in this chat
    db.query(ChatHistory).filter(
        ChatHistory.session_id == session_id
    ).delete()

    # delete chat session
    db.query(ChatSession).filter(
        ChatSession.id == session_id
    ).delete()

    db.commit()

    return {
        "message": "Chat deleted"
    }

@app.put("/rename_chat/{session_id}")
def rename_chat(
    session_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    chat = db.query(ChatSession).filter(
        ChatSession.id == session_id
    ).first()

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    chat.title = data["title"]

    db.commit()

    return {
        "message": "Chat renamed"
    }

@app.get("/sessions/{user_id}")
def get_sessions(
    user_id: int,
    db: Session = Depends(get_db)
):

    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).all()

    return sessions

@app.get("/chats/{user_id}")
def get_chats(
    user_id: int,
    db: Session = Depends(get_db)
):

    return db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).all()

@app.get("/chat_history/{session_id}")
def get_chat_history(
    session_id: int,
    db: Session = Depends(get_db)
):

    return db.query(ChatHistory).filter(
        ChatHistory.session_id == session_id
    ).all()

@app.post("/query")
async def query_rag(
    data: dict,
    db: Session = Depends(get_db)
):
    query = data["query"]
    user_id = data["user_id"]
    session_id = data.get("session_id")

    # Get last 5 messages from this chat session
    last_messages = (
        db.query(ChatHistory)
        .filter(ChatHistory.session_id == session_id)
        .order_by(ChatHistory.id.desc())
        .limit(5)
        .all()
    )

    # Build conversation context
    history_context = ""

    for msg in reversed(last_messages):
        history_context += f"""
User: {msg.question}

Assistant: {msg.answer}

"""
        
    # Generate answer
    answer = ask_rag(
        query,
        history_context
    )

    # Save current message
    new_chat = ChatHistory(
        question=query,
        answer=answer,
        user_id=user_id,
        session_id=session_id
    )

    db.add(new_chat)
    db.commit()

    return {"answer": answer}

@app.get("/history/{session_id}")
def get_history(
    session_id: int,
    db: Session = Depends(get_db)
):

    chats = db.query(ChatHistory).filter(
        ChatHistory.session_id == session_id
    ).all()

    return chats

# ---------------- (UPLOADS), FILES & SUMMARIES ----------------

UPLOAD_DIR = "uploads"
SUMMARY_FILE = "summaries.json"

os.makedirs(UPLOAD_DIR, exist_ok=True)

if not os.path.exists(SUMMARY_FILE):
    with open(SUMMARY_FILE, "w") as f:
        json.dump([], f)

@app.get("/files")
async def get_files():
    files = os.listdir(UPLOAD_DIR)
    return {"files": files}

@app.get("/summaries")
async def get_summaries():
    with open(SUMMARY_FILE, "r") as f:
        data = json.load(f)

    return {"summaries": data}