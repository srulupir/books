from django.urls import path
from .views import BookSearchAPI
from django.http import JsonResponse
from .views import RegisterView, LoginView, FavoriteView
from .views import BookListAPIView
from .views import BookRecommendationView
from .views import FavoriteRecommendationsAPI
from .views import recommendations_similar_view

def test_api(request):
    return JsonResponse({"message": "Django and React are working!"})

urlpatterns = [
    path('search/', BookSearchAPI.as_view(), name='book-search'),

    path('test/', test_api),

    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('favorites/', FavoriteView.as_view()),
    path('favorites/<int:book_id>/', FavoriteView.as_view()),
    path('books/', BookListAPIView.as_view(), name='book-list'),
    path('recommend/', BookRecommendationView.as_view(), name='book-recommend'),
    path('favorites/recommendations/', FavoriteRecommendationsAPI.as_view(), name='favorite-recommendations'),
    path('recommendations/similar/', recommendations_similar_view, name='recommendations_similar'),

]