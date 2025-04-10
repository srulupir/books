import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'books_backend.settings')
django.setup()

from api.models import Book

def fill_ids():
    for i, book in enumerate(Book.objects.all(), start=1):
        book.original_id = i
        book.save()
        print(f'Updated book {book.title} with id {i}')

if __name__ == '__main__':
    fill_ids()