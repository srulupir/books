from django.db import models
from django.contrib.auth.models import AbstractUser
from sentence_transformers import SentenceTransformer

class Book(models.Model):
    # Required fields
    title = models.CharField(max_length=500, verbose_name='Title', help_text='Required field')
    authors = models.CharField(max_length=500, verbose_name='Author', help_text='Required field')
    description = models.TextField(verbose_name='Description', help_text='Required field')
    tags = models.CharField(max_length=500, verbose_name='Tags', help_text='Required field')

    # Optional fields
    original_id = models.IntegerField(null=True, blank=True, unique=True, verbose_name='Original ID', help_text='Optional field')
    embedding = models.BinaryField(null=True, blank=True, verbose_name='Vector representation', help_text='For recommendation system')

    # New fields
    category = models.CharField(max_length=255, null=True, blank=True)
    publisher = models.CharField(max_length=255, null=True, blank=True, verbose_name='Publisher', help_text='Optional field')
    price_starting = models.FloatField(null=True, blank=True, verbose_name='Price Starting With ($)', help_text='Optional field')
    publish_month = models.IntegerField(null=True, blank=True, verbose_name='Publish Date (Month)', help_text='Optional field')
    publish_year = models.IntegerField(null=True, blank=True, verbose_name='Publish Date (Year)', help_text='Optional field')

    def __str__(self):
        return f"{self.title} - {self.authors}"

    class Meta:
        db_table = 'api_book'
        verbose_name = 'Book'
        verbose_name_plural = 'Books'

    def save(self, *args, **kwargs):
        if not self.embedding and self.description:
            model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
            self.embedding = model.encode(self.description).tobytes()
        super().save(*args, **kwargs)


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