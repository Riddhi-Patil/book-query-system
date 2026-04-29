from django.urls import path
from .views import get_books, get_book_detail, upload_books, ask, recommend

urlpatterns = [
    path('books/', get_books),
    path('books/<int:id>/', get_book_detail),
    path('upload-books/', upload_books),
    path('ask/', ask),
    path('books/recommend/<int:id>/', recommend),
]