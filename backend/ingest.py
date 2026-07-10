import os

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

UPLOAD_FOLDER = "uploads"
CHROMA_PATH = "chroma_db"

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vectordb = Chroma(
    persist_directory=CHROMA_PATH,
    embedding_function=embedding_model
)

def ingest_documents():

    for filename in os.listdir(UPLOAD_FOLDER):

        if not filename.endswith(".pdf"):
            continue

        pdf_path = os.path.join(UPLOAD_FOLDER, filename)

        print(f"Processing {filename}")

        loader = PyPDFLoader(pdf_path)
        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1200,
            chunk_overlap=200
        )

        docs = splitter.split_documents(documents)

        # Add metadata
        for doc in docs:
            doc.metadata["source_file"] = filename

        vectordb.add_documents(docs)

        print(f"Added {filename} to vector DB")

    print("Ingestion complete")


if __name__ == "__main__":
    ingest_documents()