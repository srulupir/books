# api/filters.py

import django_filters
from .models import Book

class BookFilter(django_filters.FilterSet):
    # Фильтрация по категориям (жанрам) через запятую
    category = django_filters.CharFilter(field_name='category', lookup_expr='icontains', label='Category')
    tag = django_filters.CharFilter(field_name='tags', lookup_expr='icontains')
    author = django_filters.CharFilter(field_name='authors', lookup_expr='icontains')
    year_from = django_filters.NumberFilter(field_name='publish_year', lookup_expr='gte')
    year_to = django_filters.NumberFilter(field_name='publish_year', lookup_expr='lte')

    class Meta:
        model = Book
        fields = ['category', 'tag', 'author', 'year_from', 'year_to']
