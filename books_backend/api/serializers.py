from rest_framework import serializers
from .models import User, Book, UserBookFavorite


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'


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