import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import {
    Box,
    CircularProgress,
    Grid,
    Pagination,
    TextField,
    Container,
    Button,
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
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [favorites, setFavorites] = useState(new Set());
    const [genres, setGenres] = useState([]);
    const [snackbar, setSnackbar] = useState(null);
    const { user } = useContext(AuthContext);
    const itemsPerPage = 8;

    // Настройка axios для авторизации
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(config => {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, []);

    // Загрузка книг
    const fetchBooks = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/books/', { params: filters });
            setBooks(response.data.results || response.data);
            setGenres(response.data.genres || []);
        } catch (err) {
            console.error('Error loading books:', err);
            setError('Не удалось загрузить книги');
            setSnackbar({ message: 'Ошибка загрузки книг', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    
    // Загрузка избранного
    const fetchFavorites = useCallback(async () => {
        if (!user) {
            setFavorites(new Set());
            return;
        }

        try {
            setFavoritesLoading(true);
            const response = await axios.get('/api/favorites/');
            setFavorites(new Set(response.data.map(fav => fav.book.id)));
        } catch (err) {
            console.error('Error loading favorites:', err);
            setSnackbar({ message: 'Ошибка загрузки избранного', severity: 'error' });
        } finally {
            setFavoritesLoading(false);
        }
    }, [user]);

    // Первоначальная загрузка данных
    useEffect(() => {
        const loadData = async () => {
            await fetchBooks();
            await fetchFavorites();
        };
        loadData();
    }, [fetchBooks, fetchFavorites]);

    // Обработчик избранного
    const handleFavoriteToggle = async (bookId) => {
        if (!user) {
            setSnackbar({
                message: 'Для добавления в избранное требуется авторизация',
                severity: 'warning'
            });
            return;
        }

        try {
            const newFavorites = new Set(favorites);

            if (newFavorites.has(bookId)) {
                await axios.delete(`/api/favorites/${bookId}/`);
                newFavorites.delete(bookId);
                setSnackbar({ message: 'Удалено из избранного', severity: 'info' });
            } else {
                await axios.post('/api/favorites/', { book_id: bookId });
                newFavorites.add(bookId);
                setSnackbar({ message: 'Добавлено в избранное', severity: 'success' });
            }

            setFavorites(newFavorites);
        } catch (err) {
            console.error('Favorite update error:', err);
            setSnackbar({
                message: err.response?.data?.detail || 'Ошибка при обновлении избранного',
                severity: 'error'
            });
        }
    };

    // Обработчик поиска
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    // Обработчик фильтров
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    // Обработчик сброса фильтров
    const handleResetFilters = () => {
        setFilters({});
        setSearchTerm('');
        setPage(1);
    };

    // Фильтрация книг
    const filteredBooks = books.filter(book => {
        const searchLower = searchTerm.toLowerCase();
        return (
            book.title.toLowerCase().includes(searchLower) ||
            (book.authors && book.authors.toLowerCase().includes(searchLower))
        );
    });

    const pageCount = Math.ceil(filteredBooks.length / itemsPerPage);
    const isLoading = loading || favoritesLoading;

    // Закрытие уведомления
    const handleCloseSnackbar = () => {
        setSnackbar(null);
    };

    // Рендер состояний
    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <Typography color="error" variant="h6" gutterBottom>
                    {error}
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => {
                        setError(null);
                        fetchBooks();
                        fetchFavorites();
                    }}
                    sx={{ mt: 2 }}
                >
                    Попробовать снова
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Поиск и фильтры */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <TextField
                    label="Поиск книг"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={handleSearch}
                    sx={{ width: 300, flexShrink: 0 }}
                    disabled={isLoading}
                />

                <BookFilters
                    genres={genres}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                    disabled={isLoading}
                />
            </Box>

            {/* Загрузка */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Результаты */}
            {!isLoading && (
                <>
                    {filteredBooks.length === 0 ? (
                        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                            {searchTerm || Object.values(filters).some(Boolean)
                                ? 'По вашему запросу ничего не найдено'
                                : 'Список книг пуст'}
                        </Typography>
                    ) : (
                        <>
                            <Grid container spacing={3}>
                                {filteredBooks
                                    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                                    .map(book => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                                            <BookCard
                                                book={book}
                                                isFavorite={favorites.has(book.id)}
                                                onFavoriteToggle={handleFavoriteToggle}
                                                isLoading={favoritesLoading}
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
                                        disabled={isLoading}
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
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar?.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar?.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default BookList;