from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q
from scipy.spatial import distance
import numpy as np
import logging
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserSerializer, BookSerializer
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import Book
from .filters import BookFilter
from rest_framework import generics


logger = logging.getLogger(__name__)

class BookSearchAPI(APIView):
    """
    поиск: /api/search/?q=название_книги
    """
    authentication_classes = []  # Отключаем аутентификацию для поиска
    permission_classes = [permissions.AllowAny]  # Разрешаем доступ всем

    def get(self, request):
        query = request.GET.get('q', '').strip()

        if not query:
            return Response(
                {"error": "Параметр q обязателен (например: ?q=Гарри+Поттер)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 1. Ищем книги по названию (точное или частичное совпадение)
            matched_books = Book.objects.filter(
                Q(title__icontains=query)
            )

            if not matched_books.exists():
                return Response(
                    {"error": "Книги не найдены"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # 2. Берём первую найденную книгу как базовую для рекомендаций
            base_book = matched_books.first()

            if not base_book.embedding:
                return Response(
                    {"error": "У книги отсутствует векторное представление"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # 3. Получаем эмбеддинг базовой книги
            base_embedding = np.frombuffer(base_book.embedding, dtype=np.float32)

            # 4. Ищем похожие книги среди всех остальных
            similar_books = []
            for other in Book.objects.exclude(id=base_book.id).exclude(embedding__isnull=True):
                other_embedding = np.frombuffer(other.embedding, dtype=np.float32)
                similarity = 1 - distance.cosine(base_embedding, other_embedding)
                similar_books.append({
                    'id': other.id,
                    'title': other.title,
                    'authors': other.authors,
                    'similarity': f"{similarity * 100:.1f}%"
                })

            # 5. Сортируем и возвращаем топ-5
            similar_books.sort(key=lambda x: float(x['similarity'][:-1]), reverse=True)

            return Response({
                'query': query,
                'original_book': {
                    'id': base_book.id,
                    'title': base_book.title,
                    'authors': base_book.authors
                },
                'results': similar_books[:5]
            })

        except Exception as e:
            logger.error(f"Search error: {str(e)}", exc_info=True)
            return Response(
                {"error": "Внутренняя ошибка сервера"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RegisterView(APIView):
    authentication_classes = []  # Отключаем аутентификацию для регистрации
    permission_classes = [permissions.AllowAny]  # Разрешаем доступ всем

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    authentication_classes = []  # Отключаем аутентификацию для входа
    permission_classes = [permissions.AllowAny]  # Разрешаем доступ всем

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

class FavoriteView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # Требуем аутентификацию

    def get(self, request):
        favorites = request.user.favorite_books.all()
        serializer = BookSerializer(favorites, many=True)
        return Response(serializer.data)

    def post(self, request):
        book_id = request.data.get('book_id')
        try:
            book = Book.objects.get(id=book_id)
            request.user.favorite_books.add(book)
            return Response({'status': 'added'})
        except Book.DoesNotExist:
            return Response(
                {'error': 'Book not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, book_id):
        try:
            book = Book.objects.get(id=book_id)
            request.user.favorite_books.remove(book)
            return Response({'status': 'removed'})
        except Book.DoesNotExist:
            return Response(
                {'error': 'Book not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class BookListAPIView(ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = BookFilter
    ordering_fields = ['title', 'authors', 'publish_year']
    ordering = ['title']

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        # Добавляем список жанров в ответ
        if not request.query_params:  # Только при первом запросе без фильтров
            books = Book.objects.exclude(category__isnull=True).exclude(category__exact='')
            genres = set()
            for book in books:
                if book.category:
                    genres.update([g.strip() for g in book.category.split(',') if g.strip()])
            response.data['genres'] = sorted(genres)

        return response


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import numpy as np
from scipy.spatial.distance import cosine
from sentence_transformers import SentenceTransformer
from .models import Book
import logging

logger = logging.getLogger(__name__)

# Загружаем модель один раз при старте сервера
try:
    MODEL = SentenceTransformer('all-mpnet-base-v2')
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    MODEL = None


class BookRecommendationView(APIView):
    def post(self, request):
        if not MODEL:
            return Response(
                {"error": "Recommendation system is currently unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        prompt = request.data.get('prompt', '').strip()
        if not prompt:
            return Response(
                {"error": "Prompt is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Шаг 1: Векторизуем промпт
            prompt_embedding = MODEL.encode(prompt)

            # Шаг 2: Ищем похожие книги
            books = Book.objects.exclude(embedding__isnull=True)
            recommendations = []

            for book in books:
                book_embedding = np.frombuffer(book.embedding, dtype=np.float32)
                similarity = 1 - cosine(prompt_embedding, book_embedding)

                if similarity > 0.3:  # Порог схожести (можно настроить)
                    recommendations.append({
                        'id': book.id,
                        'title': book.title,
                        'authors': book.authors,
                        'category': book.category,
                        'year': book.publish_year,
                        'similarity': float(similarity),
                        'description': book.description[:200] + '...' if book.description else ''
                    })

            # Сортируем по убыванию схожести
            recommendations.sort(key=lambda x: x['similarity'], reverse=True)

            return Response({
                'prompt': prompt,
                'results': recommendations[:10]  # Топ-10 результатов
            })

        except Exception as e:
            logger.error(f"Recommendation error: {e}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q
from scipy.spatial.distance import cosine
import numpy as np
from .models import Book

class FavoriteRecommendationsAPI(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        favorite_books = user.favorite_books.all()

        if not favorite_books.exists():
            return Response({"error": "Ваш список избранного пуст"}, status=status.HTTP_400_BAD_REQUEST)

        # Собираем эмбеддинги избранных книг
        embeddings = [
            np.frombuffer(book.embedding, dtype=np.float32)
            for book in favorite_books if book.embedding
        ]

        if not embeddings:
            return Response({"error": "Нет эмбеддингов у избранных книг"}, status=status.HTTP_400_BAD_REQUEST)

        # Вычисляем средний эмбеддинг
        avg_embedding = np.mean(embeddings, axis=0)

        # Ищем похожие книги
        all_books = Book.objects.exclude(id__in=[book.id for book in favorite_books]).exclude(embedding__isnull=True)
        similar_books = []

        for book in all_books:
            try:
                book_embedding = np.frombuffer(book.embedding, dtype=np.float32)
                similarity = 1 - cosine(avg_embedding, book_embedding)
                similar_books.append({
                    'id': book.id,
                    'title': book.title,
                    'authors': book.authors,
                    'category': book.category,
                    'similarity': round(similarity * 100, 2),
                    'description': book.description,
                    'publish_year': book.publish_year,
                })
            except:
                continue  # Пропускаем книги с ошибками

        # Сортируем и возвращаем топ-10
        similar_books.sort(key=lambda x: x['similarity'], reverse=True)
        return Response({"recommendations": similar_books[:10]})

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import User, UserBookFavorite, Book
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommendations_similar_view(request):
    user = request.user
    user_favorites = UserBookFavorite.objects.filter(user=user).select_related('book')

    if not user_favorites.exists():
        return Response({"message": "У вас нет избранных книг для рекомендаций."}, status=400)

    user_embeddings = [
        np.frombuffer(fav.book.embedding, dtype=np.float32)
        for fav in user_favorites if fav.book.embedding
    ]

    if not user_embeddings:
        return Response({"message": "Нет эмбеддингов для ваших книг."}, status=400)

    user_vector = np.mean(user_embeddings, axis=0).reshape(1, -1)

    # Получаем других пользователей и их средние эмбеддинги
    all_users = User.objects.exclude(id=user.id)
    candidates = []

    for other_user in all_users:
        other_favorites = UserBookFavorite.objects.filter(user=other_user).select_related('book')
        other_embeddings = [
            np.frombuffer(fav.book.embedding, dtype=np.float32)
            for fav in other_favorites if fav.book.embedding
        ]

        if not other_embeddings:
            continue

        other_vector = np.mean(other_embeddings, axis=0).reshape(1, -1)
        similarity = cosine_similarity(user_vector, other_vector)[0][0]

        if similarity > 0.7:  # Порог похожести
            # Добавляем книги этого пользователя для рекомендаций
            candidates.extend(other_favorites)

    # Уникальные книги из похожих пользователей, которых нет у текущего
    user_book_ids = set(fav.book.id for fav in user_favorites)
    recommended_books = []
    seen_ids = set()

    for fav in candidates:
        book = fav.book
        if book.id not in user_book_ids and book.id not in seen_ids:
            seen_ids.add(book.id)
            recommended_books.append({
                "id": book.id,
                "title": book.title,
                "description": book.description,
                "category": book.category,
            })

    return Response({"recommendations": recommended_books[:10]})
