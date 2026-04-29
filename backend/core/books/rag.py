import chromadb
import requests
from .models import Book

# ---------------------------
# CONFIG
# ---------------------------
CHROMA_PATH = "chroma_db"
LM_STUDIO_URL = "http://127.0.0.1:1234/v1"

# Global singleton for ChromaDB client to prevent "Access Violation" crashes on Windows
_CHROMA_CLIENT = None

def get_collection():
    global _CHROMA_CLIENT
    if _CHROMA_CLIENT is None:
        try:
            _CHROMA_CLIENT = chromadb.PersistentClient(path=CHROMA_PATH)
        except Exception as e:
            print(f"CRITICAL: Failed to initialize ChromaDB: {e}")
            raise e
    return _CHROMA_CLIENT.get_or_create_collection(name="books")

# ---------------------------
# EMBEDDING HELPER
# ---------------------------
def get_embedding(text):
    try:
        response = requests.post(
            f"{LM_STUDIO_URL}/embeddings",
            json={
                "input": text,
                "model": "text-embedding-nomic-embed-text-v1.5"
            },
            timeout=30 # Increased timeout
        )
        if response.status_code == 200:
            return response.json()['data'][0]['embedding']
        else:
            print(f"Embedding API Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Embedding Exception: {e}")
    return None

# ---------------------------
# LLM CALLER
# ---------------------------
def call_llm(prompt):
    try:
        response = requests.post(
            f"{LM_STUDIO_URL}/chat/completions",
            json={
                "model": "mistralai/mistral-7b-instruct-v0.3",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7
            },
            timeout=120 # Higher timeout for heavy RAG queries
        )
        if response.status_code == 200:
            data = response.json()
            return data['choices'][0]['message']['content']
        else:
            print(f"LLM API Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"LLM Exception: {e}")
    return None

# ---------------------------
# INDEXING
# ---------------------------
def index_books(books_to_index=None):
    print("--- STARTING INDEXING ---")
    try:
        collection = get_collection()
    except:
        return
        
    if books_to_index is None:
        books_to_index = Book.objects.all()
    
    total = books_to_index.count()
    for i, book in enumerate(books_to_index):
        try:
            # Quick check if already indexed
            existing = collection.get(ids=[str(book.id)])
            if existing and existing['ids']:
                continue
                
            print(f"Indexing ({i+1}/{total}): {book.title}")
            text = f"{book.title}. {book.description}"
            embedding = get_embedding(text)
            
            if embedding:
                collection.add(
                    ids=[str(book.id)],
                    embeddings=[embedding],
                    documents=[text],
                    metadatas=[{"title": book.title, "id": book.id}]
                )
        except Exception as e:
            print(f"Skipping book {book.id} due to indexing error: {e}")
            
    print("--- INDEXING FINISHED ---")

# ---------------------------
# ASK QUESTION (RAG)
# ---------------------------
def ask_question(question):
    try:
        collection = get_collection()
        query_embedding = get_embedding(question)
        
        if not query_embedding:
            return "Error: Could not generate embeddings. Is LM Studio running?"

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=5
        )

        context = results['documents']
        metadatas = results['metadatas']

        if not context or not context[0]:
            return "I don't have any book data in my memory yet. Please click 'Scrape' on the Dashboard first!"

        context_with_sources = []
        for i in range(len(context[0])):
            doc = context[0][i]
            meta = metadatas[0][i]
            source = meta.get('title', 'Unknown Source')
            context_with_sources.append(f"Content: {doc}\nSource: {source}")

        context_text = "\n\n".join(context_with_sources)

        prompt = f"""
You are a helpful book assistant. Use the following context to answer the user's question.
If the answer isn't in the context, say you don't know based on the current library.

IMPORTANT: Cite your sources by mentioning the book title in brackets like [Book Title].

Context:
{context_text}

User Question: {question}
"""

        answer = call_llm(prompt)
        return answer.strip() if answer else "AI failed to respond. Check if LM Studio is busy."
            
    except Exception as e:
        print(f"RAG Error: {e}")
        return "The AI system is currently unavailable. Please wait a moment."

# ---------------------------
# RECOMMENDATIONS
# ---------------------------
def recommend_books(book_id):
    try:
        collection = get_collection()
        book = Book.objects.get(id=book_id)
        text = f"{book.title}. {book.description}"
        embedding = get_embedding(text)
        
        if not embedding:
            return []

        results = collection.query(
            query_embeddings=[embedding],
            n_results=4
        )
        
        titles = [m['title'] for m in results['metadatas'][0] if m['title'] != book.title]
        return titles[:3]
    except Exception as e:
        print(f"Recommendation Error: {e}")
        return []