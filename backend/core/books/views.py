from .rag import ask_question, index_books, recommend_books, call_llm
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer
from .scraper import scrape_books
from django.shortcuts import get_object_or_404


# ---------------------------
# AI GENERATION
# ---------------------------
def generate_ai(book):
    prompt = f"""
    Analyze this book:
    Title: {book.title}
    Original Rating: {book.rating}
    Description: {book.description}

    Provide:
    1. A realistic Author name for this book.
    2. A 2-sentence summary.
    3. A single word genre.

    Format:
    Author: [Name]
    Summary: [Text]
    Genre: [Genre]
    """
    output = call_llm(prompt)

    if output:
        try:
            lines = output.strip().split("\n")
            for line in lines:
                if line.lower().startswith("author:"):
                    book.author = line.split(":", 1)[1].strip()
                elif line.lower().startswith("summary:"):
                    book.summary = line.split(":", 1)[1].strip()
                elif line.lower().startswith("genre:"):
                    book.genre = line.split(":", 1)[1].strip()
            
            # Remove any quotes the AI might have added to the author name
            if book.author:
                book.author = book.author.replace('"', '').replace("'", "")
                
            book.save()
        except Exception as e:
            print(f"Error parsing AI output: {e}")
            fallback_ai(book)
    else:
        fallback_ai(book)

def fallback_ai(book):
    title = book.title.lower()
    if any(word in title for word in ["love", "heart", "romance"]):
        book.genre = "Romance"
    elif any(word in title for word in ["history", "world", "human"]):
        book.genre = "History"
    elif any(word in title for word in ["future", "space", "science"]):
        book.genre = "Science Fiction"
    else:
        book.genre = "Drama"

    book.summary = f"{book.title} explores themes of {book.genre.lower()}."
    book.save()


# ---------------------------
# GET ALL BOOKS
# ---------------------------
@api_view(['GET'])
def get_books(request):
    books = Book.objects.all()
    return Response(BookSerializer(books, many=True).data)


# ---------------------------
# GET BOOK DETAIL
# ---------------------------
@api_view(['GET'])
def get_book_detail(request, id):
    try:
        book = Book.objects.get(id=id)
        return Response(BookSerializer(book).data)
    except Book.DoesNotExist:
        return Response({"error": "Book not found in database"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def upload_books(request):
    try:
        print("--- STARTING PROCESS ---")
        scrape_books()
        
        # Only process books that don't have a genre yet (newly scraped)
        books_to_process = Book.objects.filter(genre__isnull=True) | Book.objects.filter(genre="")
        
        print(f"--- ANALYZING {books_to_process.count()} NEW BOOKS ---")
        for index, book in enumerate(books_to_process):
            try:
                generate_ai(book)
            except:
                fallback_ai(book)

        print("--- UPDATING VECTOR MEMORY ---")
        try:
            # Index all books that need embeddings (more robust)
            index_books()
        except Exception as idx_err:
            print(f"Indexing error (continuing): {idx_err}")
        
        print("--- ALL DONE ---")
        return Response({"status": "success", "message": "Library updated successfully!"})
    except Exception as e:
        print(f"CRITICAL UPLOAD ERROR: {e}")
        return Response({"status": "error", "error": str(e)}, status=500)


# ---------------------------
# ASK (RAG)
# ---------------------------
@api_view(['POST'])
def ask(request):
    try:
        question = request.data.get('question')
        if not question:
            return Response({"error": "Please provide a question"}, status=400)
            
        answer = ask_question(question)
        return Response({"answer": answer})
    except Exception as e:
        print(f"ASK VIEW ERROR: {e}")
        return Response({"error": "AI service is restarting. Please try again in 5 seconds."}, status=500)


# ---------------------------
# RECOMMEND
# ---------------------------
@api_view(['GET'])
def recommend(request, id):
    try:
        results = recommend_books(id)
        return Response({"recommendations": results})
    except Exception as e:
        print(f"RECOMMEND VIEW ERROR: {e}")
        return Response({"recommendations": []})