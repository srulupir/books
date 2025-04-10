import faiss
import numpy as np
from django.conf import settings
from api.models import Book

class BookRecommender:
    def __init__(self):
        self.index = None
        self.book_ids = []  # Соответствие индексов FAISS и ID книг

    def load_index(self):
        """Загрузка FAISS-индекса и списка ID книг"""
        self.index = faiss.read_index(str(settings.BASE_DIR / 'data' / 'book_index.faiss'))
        self.book_ids = list(Book.objects.values_list('original_id', flat=True))

    def get_similar(self, book_id, k=5):
        """Получение рекомендаций для книги"""
        if not self.index:
            self.load_index()  # Инициализация при первом вызове

        try:
            book = Book.objects.get(original_id=book_id)
            embedding = np.frombuffer(book.embedding, dtype='float32').reshape(1, -1)
            distances, indices = self.index.search(embedding, k + 1)  # k+1 чтобы исключить саму книгу
            return [self.book_ids[i] for i in indices[0][1:] if i < len(self.book_ids)]
        except Exception as e:
            print(f"Error: {e}")
            return []