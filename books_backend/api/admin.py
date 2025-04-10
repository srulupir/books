from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Book

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'authors',
        'publisher',
        'publish_year',
        'publish_month',
        'category',
        'tags',
    )
    search_fields = ('title', 'authors', 'category')
    list_filter = ('publish_year', 'publisher', 'category')

admin.site.register(User, UserAdmin)
