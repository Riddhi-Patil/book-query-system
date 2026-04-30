import os
import sys
import django
import requests

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend', 'core'))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from books.models import Book
from books.rag import get_embedding

def reindex_all():
    print("--- STARTING RE-INDEXING (SQLITE) ---")
    
    # Get all books that don't have embeddings yet
    books = Book.objects.filter(embedding__isnull=True)
    total = books.count()
    print(f"Found {total} books to index.")

    if total == 0:
        print("All books are already indexed!")
        return

    for i, book in enumerate(books):
        try:
            print(f"[{i+1}/{total}] Indexing: {book.title}")
            text = f"{book.title}. {book.description}"
            embedding = get_embedding(text)
            
            if embedding:
                book.embedding = embedding
                book.save()
            else:
                print(f"Failed to get embedding for: {book.title}")
                
        except Exception as e:
            print(f"Error indexing book {book.id}: {e}")
            continue

    print("--- RE-INDEXING FINISHED ---")

if __name__ == "__main__":
    reindex_all()
