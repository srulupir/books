from django.core.management.base import BaseCommand
from api.models import Book
from services.recommender import BookRecommender


def parse_genres(genre_str):
    """Преобразует строку жанров в множество нормализованных жанров."""
    return set(g.strip().lower() for g in genre_str.split(',') if g.strip())


class Command(BaseCommand):
    help = 'Evaluate the semantic book recommender system'

    def handle(self, *args, **options):
        self.stdout.write("📚 Запуск оценки рекомендаций...")

        # Загружаем книги с жанрами и описаниями
        books = Book.objects.exclude(description=None).exclude(category=None)[:1600]
        recommender = BookRecommender()

        total_recommendations = 0
        genre_match_count = 0
        jaccard_scores = []

        for book in books:
            rec_ids = recommender.get_similar(book.original_id)
            recs = Book.objects.filter(original_id__in=rec_ids)

            original_genres = parse_genres(book.category)

            for rec in recs:
                rec_genres = parse_genres(rec.category)
                intersection = original_genres & rec_genres
                union = original_genres | rec_genres

                if intersection:
                    genre_match_count += 1

                if union:
                    jaccard_scores.append(len(intersection) / len(union))

                total_recommendations += 1

        genre_match_rate = genre_match_count / total_recommendations if total_recommendations else 0
        avg_jaccard = sum(jaccard_scores) / len(jaccard_scores) if jaccard_scores else 0

        self.stdout.write("\n🎯 Результаты оценки:")
        self.stdout.write(f"🔹 Всего рекомендаций: {total_recommendations}")
        self.stdout.write(f"🔹 Genre Match Rate: {genre_match_rate:.2%}")
        self.stdout.write(f"🔹 Средняя Jaccard похожесть жанров: {avg_jaccard:.2%}")
