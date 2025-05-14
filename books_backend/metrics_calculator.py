import random
import numpy as np
from django.conf import settings
from api.models import Book
from services.recommender import BookRecommender  # путь может отличаться

def genre_overlap(genres1, genres2):
    set1 = set(map(str.strip, genres1.lower().split(',')))
    set2 = set(map(str.strip, genres2.lower().split(',')))
    return len(set1 & set2) > 0

def jaccard_similarity(genres1, genres2):
    set1 = set(map(str.strip, genres1.lower().split(',')))
    set2 = set(map(str.strip, genres2.lower().split(',')))
    union = set1 | set2
    intersection = set1 & set2
    return len(intersection) / len(union) if union else 0

def evaluate_recommendations(sample_size=500, top_k=5):
    print(f"🔍 Оцениваем семантические рекомендации (sample_size={sample_size}, top_k={top_k})")

    recommender = BookRecommender()
    recommender.load_index()

    all_book_ids = list(Book.objects.exclude(embedding=None).values_list('original_id', flat=True))
    sample_ids = random.sample(all_book_ids, min(sample_size, len(all_book_ids)))

    total_recommendations = 0
    genre_matches = 0
    jaccard_scores = []

    for book_id in sample_ids:
        try:
            book = Book.objects.get(original_id=book_id)
            if not book.category:
                continue

            recommendations = recommender.get_similar(book_id, k=top_k)
            for rec_id in recommendations:
                rec_book = Book.objects.get(original_id=rec_id)
                if not rec_book.category:
                    continue

                # Genre Match
                if genre_overlap(book.category, rec_book.category):
                    genre_matches += 1

                # Jaccard
                jaccard = jaccard_similarity(book.category, rec_book.category)
                jaccard_scores.append(jaccard)
                total_recommendations += 1

        except Exception as e:
            print(f"⚠️ Ошибка с книгой {book_id}: {e}")
            continue

    match_rate = genre_matches / total_recommendations if total_recommendations else 0
    avg_jaccard = sum(jaccard_scores) / len(jaccard_scores) if jaccard_scores else 0

    print("\n📊 Результаты оценки:")
    print(f"🔹 Genre Match Rate (Top-{top_k}): {match_rate:.2%}")
    print(f"🔹 Average Jaccard Similarity: {avg_jaccard:.4f}")

if __name__ == "__main__":
    evaluate_recommendations(sample_size=500, top_k=5)
