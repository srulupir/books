import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import {
    Box,
    CircularProgress,
    Grid,
    Pagination,
    TextField,
    Container,
    Typography,
    Snackbar,
    Alert
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import BookFilters from './BookFilters';
import BookCard from './BookCard';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        author: '',
        year_from: null,
        year_to: null
    });
    const [page, setPage] = useState(1);
    const [favorites, setFavorites] = useState(new Set());
    const [genres, setGenres] = useState([]);
    const [snackbar, setSnackbar] = useState(null);
    const { user } = useContext(AuthContext);
    const itemsPerPage = 8;

    // Настройка axios
    useEffect(() => {
        const interceptor = axios.interceptors.request.use(config => {
            const token = localStorage.getItem('access_token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
        return () => axios.interceptors.request.eject(interceptor);
    }, []);

    // Извлечение жанров из списка книг
    const extractGenres = (books) => {
        const genreSet = new Set();
        books.forEach(book => {
            if (book.category) {
                book.category.split(',').forEach(g => {
                    const trimmed = g.trim();
                    if (trimmed) genreSet.add(trimmed);
                });
            }
        });
        return Array.from(genreSet).sort();
    };

    // Загрузка данных
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
            );

            const [booksRes, favoritesRes] = await Promise.all([
                axios.get('/api/books/', { params }),
                user ? axios.get('/api/favorites/') : Promise.resolve({ data: [] })
            ]);

            const loadedBooks = booksRes.data.results || booksRes.data;
            setBooks(loadedBooks);
            setFavorites(new Set(favoritesRes.data.map(fav => fav.book.id)));

            // Обновляем список жанров
            if (!params.category) { // Только если не фильтруем по жанру
                setGenres(extractGenres(loadedBooks));
            }
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            setSnackbar({ message: 'Ошибка загрузки данных', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [filters, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Обработчики
    const handleSearch = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, search: value }));
        setPage(1);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1);
    };

    const handleResetFilters = () => {
        setFilters({
            search: '',
            category: '',
            author: '',
            year_from: null,
            year_to: null
        });
        setPage(1);
    };

    const handleFavoriteToggle = async (bookId) => {
        if (!user) {
            setSnackbar({ message: 'Требуется авторизация', severity: 'warning' });
            return;
        }

        try {
            const isFavorite = favorites.has(bookId);
            const method = isFavorite ? 'delete' : 'post';
            const url = isFavorite ? `/api/favorites/${bookId}/` : '/api/favorites/';

            await axios[method](url, isFavorite ? null : { book_id: bookId });

            setFavorites(prev => {
                const newFavorites = new Set(prev);
                isFavorite ? newFavorites.delete(bookId) : newFavorites.add(bookId);
                return newFavorites;
            });

            setSnackbar({
                message: isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное',
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                message: err.response?.data?.detail || 'Ошибка операции',
                severity: 'error'
            });
        }
    };

    // Пагинация
    const pageCount = Math.ceil(books.length / itemsPerPage);
    const paginatedBooks = books.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Поиск и фильтры */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    label="Поиск книг"
                    variant="outlined"
                    size="small"
                    value={filters.search}
                    onChange={handleSearch}
                    sx={{ width: 300 }}
                    disabled={loading}
                />
                <BookFilters
                    genres={genres}
                    onFilter={handleFilterChange}
                    onReset={handleResetFilters}
                    disabled={loading}
                />
            </Box>

            {/* Загрузка */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Результаты */}
            {!loading && (
                <>
                    {books.length === 0 ? (
                        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                            {Object.values(filters).some(Boolean)
                                ? 'По вашему запросу ничего не найдено'
                                : 'Список книг пуст'}
                        </Typography>
                    ) : (
                        <>
                            <Grid container spacing={3}>
                                {paginatedBooks.map(book => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                                        <BookCard
                                            book={book}
                                            isFavorite={favorites.has(book.id)}
                                            onFavoriteToggle={handleFavoriteToggle}
                                        />
                                    </Grid>
                                ))}
                            </Grid>

                            {pageCount > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                    <Pagination
                                        count={pageCount}
                                        page={page}
                                        onChange={(_, value) => setPage(value)}
                                        color="primary"
                                        disabled={loading}
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Уведомления */}
            <Snackbar
                open={!!snackbar}
                autoHideDuration={6000}
                onClose={() => setSnackbar(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar?.severity}>
                    {snackbar?.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default BookList;