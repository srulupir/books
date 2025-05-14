import umap
import numpy as np
import matplotlib.pyplot as plt
from collections import Counter
from api.models import Book

# 1) Загружаем все книги с эмбеддингами и жанрами
books = list(Book.objects.exclude(embedding=None).exclude(category=None).all())

# 2) Собираем все жанры и считаем частоты
all_genres = []
for book in books:
    all_genres += [g.strip().lower() for g in book.category.split(',') if g.strip()]
genre_counts = Counter(all_genres)

# 3) Берём топ-10 самых частотных жанров
top10 = [genre for genre, _ in genre_counts.most_common(10)]
print("Top-10 genres:", top10)

# 4) Фильтруем книги и готовим эмбеддинги + метки
embeddings = []
labels = []
for book in books:
    genres = [g.strip().lower() for g in book.category.split(',')]
    # найдем пересечение с топ10
    common = [g for g in genres if g in top10]
    if not common:
        continue
    embeddings.append(np.frombuffer(book.embedding, dtype='float32'))
    # для метки возьмём первый встречный жанр из топ10
    labels.append(common[0])

embeddings = np.vstack(embeddings)

# 5) Преобразуем метки жанров в числа (0..9)
label_to_int = {g:i for i, g in enumerate(top10)}
label_ints = np.array([label_to_int[l] for l in labels])

# 6) UMAP‑проекция
umap_model = umap.UMAP(n_components=2, random_state=42)
proj = umap_model.fit_transform(embeddings)

# 7) Рисуем
plt.figure(figsize=(10, 8))
scatter = plt.scatter(
    proj[:, 0], proj[:, 1],
    c=label_ints,
    cmap='tab10',
    s=30,
    alpha=0.8
)
# легенда
handles, _ = scatter.legend_elements()
plt.legend(handles, top10, title='Жанры', bbox_to_anchor=(1.05, 1), loc='upper left')
plt.title('UMAP‑визуализация (топ‑10 жанров)')
plt.xlabel('UMAP 1')
plt.ylabel('UMAP 2')
plt.tight_layout()
plt.show()
