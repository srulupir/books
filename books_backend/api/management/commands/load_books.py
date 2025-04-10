import pandas as pd
import numpy as np
from django.core.management import BaseCommand
from django.conf import settings
from api.models import Book
from tqdm import tqdm
import os


class Command(BaseCommand):
    help = 'Load books with mandatory embeddings from CSV and numpy files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--chunk-size',
            type=int,
            default=1000,
            help='Number of books to process in each batch'
        )

    def _safe_float(self, value):
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    def _safe_int(self, value):
        try:
            return int(float(value))  # иногда приходит как '12.0'
        except (TypeError, ValueError):
            return None

    def handle(self, *args, **options):
        # Paths setup
        data_dir = settings.BASE_DIR / 'data'
        csv_path = data_dir / 'processed_books.csv'
        embeddings_path = data_dir / 'book_embeddings.npy'

        # Validate critical files
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"CSV file not found at {csv_path}")
        if not os.path.exists(embeddings_path):
            raise FileNotFoundError(f"Embeddings file not found at {embeddings_path}")

        # Load data
        self.stdout.write(self.style.MIGRATE_HEADING('Loading data files...'))
        try:
            df = pd.read_csv(csv_path)
            embeddings = np.load(embeddings_path)
        except Exception as e:
            raise ValueError(f"Error loading files: {str(e)}")

        # Validate data consistency
        if len(df) != len(embeddings):
            raise ValueError(
                f"Data mismatch: CSV has {len(df)} rows, "
                f"but embeddings have {len(embeddings)} vectors"
            )

        # Check required columns
        required_columns = ['Title', 'Description', 'Category']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"CSV missing required columns: {missing_columns}")

        # Clear existing data
        self.stdout.write(self.style.WARNING('Clearing existing books...'))
        Book.objects.all().delete()

        # Batch import with progress bar
        chunk_size = options['chunk_size']
        success_count = 0

        with tqdm(total=len(df), desc="Importing books") as pbar:
            for i in range(0, len(df), chunk_size):
                chunk = df.iloc[i:i + chunk_size]
                books = []

                for idx, row in chunk.iterrows():
                    try:
                        books.append(Book(
                            original_id=idx,
                            title=row['Title'],
                            authors=row.get('Authors', 'Unknown Author'),
                            description=row['Description'],
                            tags=row['tags'],
                            embedding=embeddings[idx].tobytes(),
                            category=row['Category'],
                            publisher=row.get('Publisher'),
                            price_starting=self._safe_float(row.get('Price Starting With ($)')),
                            publish_month=self._safe_int(row.get('Publish Date (Month)')),
                            publish_year=self._safe_int(row.get('Publish Date (Year)'))
                        ))

                    except Exception as e:
                        self.stdout.write(self.style.ERROR(
                            f"Error on row {idx}: {str(e)}"
                        ))
                        continue

                if books:
                    Book.objects.bulk_create(books)
                    success_count += len(books)
                pbar.update(len(chunk))

        # Final report
        self.stdout.write(self.style.SUCCESS(
            f"\nSuccessfully loaded {success_count}/{len(df)} books\n"
            f"Embedding dimensions: {embeddings.shape[1]}\n"
            f"First vector sample: {np.frombuffer(books[0].embedding)[:5]}..."
        ))