import os
import requests
import numpy as np
from .models import Book

# ---------------------------
# CONFIG
# ---------------------------
LM_STUDIO_URL = "http://127.0.0.1:1234/v1"

# ---------------------------
# VECTOR MATH HELPER
# ---------------------------
def cosine_similarity(v1, v2):
    v1 = np.array(v1)
    v2 = np.array(v2)
    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 0
    return dot_product / (norm_v1 * norm_v2)

# ---------------------------
# EMBEDDING HELPER
# ---------------------------
def get_embedding(text):
    try:
        # Limit text length to avoid token limit issues in some models
        text = text[:1000]
        response = requests.post(
            f"{LM_STUDIO_URL}/embeddings",
            json={
                "input": text,
                "model": "nomic-ai/nomic-embed-text-v1.5-GGUF"
            },
            timeout=30
        )
        if response.status_code == 200:
            return response.json()['data'][0]['embedding']
        else:
            # Try a second time with a more generic model name if the first one fails
            response = requests.post(
                f"{LM_STUDIO_URL}/embeddings",
                json={
                    "input": text,
                },
                timeout=30
            )
            if response.status_code == 200:
                return response.json()['data'][0]['embedding']
            print(f"Embedding API Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Embedding Exception: {e}")
    return None

# ---------------------------
# LLM CALLER
# ---------------------------
def call_llm(messages):
    try:
        # If passed a string, convert to message format
        if isinstance(messages, str):
            messages = [{"role": "user", "content": messages}]
            
        response = requests.post(
            f"{LM_STUDIO_URL}/chat/completions",
            json={
                "messages": messages,
                "temperature": 0.1, # Lowest temperature = fastest processing
                "max_tokens": 150    # Shortest response = fastest generation
            },
            timeout=300
        )
        if response.status_code == 200:
            data = response.json()
            # Handle potential variation in response structure from different LLM servers
            if 'choices' in data and len(data['choices']) > 0:
                choice = data['choices'][0]
                if 'message' in choice and 'content' in choice['message']:
                    return choice['message']['content']
                elif 'text' in choice:
                    return choice['text']
            return None
        else:
            print(f"LLM API Error: {response.status_code} - {response.text}")
    except requests.exceptions.Timeout:
        print("LLM Error: Request timed out. LM Studio might be overloaded.")
    except Exception as e:
        print(f"LLM Exception: {e}")
    return None

# ---------------------------
# INDEXING
# ---------------------------
def index_books(books_to_index=None):
    print("--- STARTING INDEXING (SQLITE) ---")
    
    if books_to_index is None:
        # Index all books that don't have embeddings yet
        books_to_index = Book.objects.filter(embedding__isnull=True)
    
    total = books_to_index.count()
    if total == 0:
        print("No new books to index.")
        return

    print(f"Found {total} books to index.")
    
    for i, book in enumerate(books_to_index):
        try:
            print(f"Indexing ({i+1}/{total}): {book.title}")
            text = f"{book.title}. {book.description}"
            embedding = get_embedding(text)
            
            if embedding:
                book.embedding = embedding
                book.save()
            else:
                print(f"Failed to get embedding for: {book.title}")
        except Exception as e:
            print(f"Skipping book {book.id} due to indexing error: {e}")
            
    print("--- INDEXING FINISHED ---")

# ---------------------------
# ASK QUESTION (RAG)
# ---------------------------
def ask_question(question):
    try:
        query_embedding = get_embedding(question)
        if not query_embedding:
            return "Error: Could not generate embeddings. Is LM Studio running?"

        # Get all books with embeddings
        books = Book.objects.exclude(embedding__isnull=True)
        if not books.exists():
            return "I don't have any book data in my memory yet. Please click 'Scrape' on the Dashboard first!"

        # Calculate similarities
        similarities = []
        for book in books:
            score = cosine_similarity(query_embedding, book.embedding)
            similarities.append((score, book))

        # Sort by score descending
        similarities.sort(key=lambda x: x[0], reverse=True)
        
        # Take only the TOP match for absolute maximum speed
        top_results = similarities[:1]
        
        context_with_sources = []
        for score, book in top_results:
            if score > 0.1:
                # Use only the title and a snippet of the description
                snippet = book.description[:300]
                context_with_sources.append(f"Book: {book.title}\nInfo: {snippet}")

        if not context_with_sources:
            return "No matching books found. Try a different topic!"

        context_text = "\n\n".join(context_with_sources)

        # Ultra-short prompt for speed
        prompt = f"Using this: {context_text}\n\nAnswer briefly: {question}"

        answer = call_llm(prompt)
        return answer.strip() if answer else "AI failed to respond. Check if LM Studio is busy."
            
    except Exception as e:
        print(f"RAG Error: {e}")
        return f"The AI system encountered an error: {str(e)}"

# ---------------------------
# RECOMMENDATIONS
# ---------------------------
def recommend_books(book_id):
    try:
        book = Book.objects.get(id=book_id)
        if not book.embedding:
            # Try to index it on the fly
            text = f"{book.title}. {book.description}"
            book.embedding = get_embedding(text)
            book.save()
            
        if not book.embedding:
            return []

        # Get all other books with embeddings
        other_books = Book.objects.exclude(id=book.id).exclude(embedding__isnull=True)
        
        similarities = []
        for other in other_books:
            score = cosine_similarity(book.embedding, other.embedding)
            similarities.append((score, other.title))

        similarities.sort(key=lambda x: x[0], reverse=True)
        return [title for score, title in similarities[:3]]
        
    except Exception as e:
        print(f"Recommendation Error: {e}")
        return []
