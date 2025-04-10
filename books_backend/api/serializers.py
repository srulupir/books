from rest_framework import serializers
from .models import Book, User, UserBookFavorite


class BookSerializer(serializers.ModelSerializer):
    # Преобразуем категории в список для удобства фронтенда
    categories = serializers.SerializerMethodField()

    def get_categories(self, obj):
        # Разделяем категории по запятой и возвращаем их как список
        return [c.strip() for c in obj.category.split(',') if c.strip()]

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'authors',
            'description',
            'tags',
            'category',
            'categories',  # добавляем поле категорий как список
            'publisher',
            'price_starting',
            'publish_year',
            'publish_month'
        ]
        # Исключаем embedding и другие технические поля
        extra_kwargs = {
            'embedding': {'write_only': True}
        }


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Пароль только для записи

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class FavoriteSerializer(serializers.ModelSerializer):
    book = BookSerializer()

    class Meta:
        model = UserBookFavorite
        fields = ('book', 'added_at')
        depth = 1