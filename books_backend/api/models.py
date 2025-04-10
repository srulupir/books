from django.db import models


class Book(models.Model):
    # Required fields
    title = models.CharField(
        max_length=500,
        verbose_name='Title',
        help_text='Required field'
    )
    authors = models.CharField(
        max_length=500,
        verbose_name='Author',
        help_text='Required field'
    )
    description = models.TextField(
        verbose_name='Description',
        help_text='Required field'
    )
    tags = models.CharField(
        max_length=500,
        verbose_name='Genres/Tags',
        help_text='Required field. Separate with commas'
    )

    # Optional fields
    original_id = models.IntegerField(
        null=True,
        blank=True,
        unique=True,
        verbose_name='Original ID',
        help_text='Optional field'
    )
    embedding = models.BinaryField(
        null=True,
        blank=True,
        verbose_name='Vector representation',
        help_text='For recommendation system'
    )

    def __str__(self):
        return f"{self.title} - {self.authors}"

    class Meta:
        db_table = 'api_book'
        verbose_name = 'Book'
        verbose_name_plural = 'Books'


from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # Added related_name to avoid conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='api_users',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='api_users_permissions',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.',
    )

    # Relationship with books
    favorite_books = models.ManyToManyField(
        'Book',
        through='UserBookFavorite',
        related_name='users_who_favorited',
        verbose_name='Favorite books'
    )

    def __str__(self):
        return self.username  # or self.email if you override email field

    class Meta:
        db_table = 'api_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class UserBookFavorite(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favorite_relations'
    )
    book = models.ForeignKey(
        'Book',
        on_delete=models.CASCADE,
        related_name='favorited_by_users'
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')
        verbose_name = 'Favorite book'
        verbose_name_plural = 'Favorite books'

    def __str__(self):
        return f"{self.user} -> {self.book}"