from django.core.management.base import BaseCommand
from books.scraper import scrape_books
from books.models import Book
from books.rag import index_books, call_llm
from books.views import generate_ai, fallback_ai
import time

class Command(BaseCommand):
    help = 'Scrapes, analyzes, and indexes books from the library'

    def add_arguments(self, parser):
        parser.add_argument('--pages', type=int, default=50, help='Number of pages to scrape')

    def handle(self, *args, **options):
        max_pages = options['pages']
        
        self.stdout.write(self.style.SUCCESS(f'--- STARTING FULL LIBRARY LOAD ({max_pages} pages) ---'))
        
        # 1. Scrape
        self.stdout.write('Scraping books...')
        scrape_books(max_pages=max_pages)
        
        # 2. AI Analysis
        books_to_process = Book.objects.filter(genre__isnull=True) | Book.objects.filter(genre="")
        total = books_to_process.count()
        self.stdout.write(f'Analyzing {total} new books with AI...')
        
        for i, book in enumerate(books_to_process):
            self.stdout.write(f'[{i+1}/{total}] Analyzing: {book.title}')
            try:
                generate_ai(book)
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'AI Error for {book.title}: {e}'))
                fallback_ai(book)
        
        # 3. Indexing
        self.stdout.write('Updating vector memory (indexing)...')
        try:
            index_books()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Indexing error: {e}'))
            
        self.stdout.write(self.style.SUCCESS('--- LIBRARY LOAD COMPLETE ---'))
