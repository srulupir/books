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