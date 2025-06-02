import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/book/BookCard';
import { Grid, Typography, Container, CircularProgress, Box, Button, Paper, Chip, Stack } from '@mui/material';

const FavoritesPage = () => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const [recLoading, setRecLoading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);

    const [similarRecLoading, setSimilarRecLoading] = useState(false);
    const [similarRecommendations, setSimilarRecommendations] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) {
                navigate('/auth');
                return;
            }

            try {
                const { data } = await axios.get('/api/favorites/');
                setFavorites(data || []);
            } catch (error) {
                console.error('Ошибка загрузки избранного:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user, navigate]);

    const getRecommendations = async () => {
        if (favorites.length === 0) return;

        try {
            setRecLoading(true);
            const { data } = await axios.post('/api/favorites/recommendations/');
            setRecommendations(data.recommendations || []);
        } catch (error) {
            console.error('Ошибка получения рекомендаций:', error);
        } finally {
            setRecLoading(false);
        }
    };

    // Новая функция для рекомендаций по похожим пользователям
    const getSimilarRecommendations = async () => {
        try {
            setSimilarRecLoading(true);
            const { data } = await axios.get('/api/recommendations/similar/');
            setSimilarRecommendations(data.recommendations || []);
        } catch (error) {
            console.error('Ошибка получения похожих рекомендаций:', error);
        } finally {
            setSimilarRecLoading(false);
        }
    };

    const handleRemoveFavorite = async (bookId) => {
        try {
            await axios.delete(`/api/favorites/${bookId}/`);
            setFavorites(favorites.filter((book) => book.id !== bookId));
        } catch (error) {
            console.error('Ошибка удаления из избранного:', error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                Мои избранные книги
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {favorites.length > 0 ? (
                            favorites.map((book) => (
                                <Grid item xs={12} sm={6} md={4} key={book.id}>
                                    <BookCard
                                        book={book}
                                        isFavorite={true}
                                        onFavoriteToggle={handleRemoveFavorite}
                                    />
                                </Grid>
                            ))
                        ) : (
                            <Typography>Ваш список избранного пуст</Typography>
                        )}
                    </Grid>

                    {favorites.length > 0 && (
                        <>
                            {/* Блок рекомендаций на основе избранных книг */}
                            <Box sx={{ mt: 4 }}>
                                <Paper elevation={3} sx={{ p: 3 }}>
                                    <Typography variant="h5">Рекомендации на основе ваших избранных книг</Typography>
                                    <Button
                                        variant="contained"
                                        onClick={getRecommendations}
                                        disabled={recLoading}
                                        sx={{ mt: 2 }}
                                    >
                                        {recLoading ? <CircularProgress size={24} /> : 'Получить рекомендации'}
                                    </Button>

                                    {recommendations.length > 0 && (
                                        <Grid container spacing={3} sx={{ mt: 2 }}>
                                            {recommendations.map((book) => (
                                                <Grid item xs={12} sm={6} md={4} key={book.id}>
                                                    <Paper sx={{ p: 2 }}>
                                                        <Typography variant="h6">{book.title}</Typography>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            {book.authors}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {book.description?.slice(0, 100)}...
                                                        </Typography>
                                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                            <Chip label={`Сходство: ${book.similarity}%`} color="primary" size="small" />
                                                            {book.publish_year && (
                                                                <Chip label={`Год: ${book.publish_year}`} variant="outlined" size="small" />
                                                            )}
                                                            {book.category && (
                                                                <Chip label={book.category.split(',')[0]} variant="outlined" size="small" />
                                                            )}
                                                        </Stack>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </Paper>
                            </Box>

                            {/* Новый блок рекомендаций на основе похожих пользователей */}
                            <Box sx={{ mt: 4 }}>
                                <Paper elevation={3} sx={{ p: 3 }}>
                                    <Typography variant="h5">Вам также может понравиться (похожие пользователи)</Typography>
                                    <Button
                                        variant="contained"
                                        onClick={getSimilarRecommendations}
                                        disabled={similarRecLoading}
                                        sx={{ mt: 2 }}
                                    >
                                        {similarRecLoading ? <CircularProgress size={24} /> : 'Получить рекомендации'}
                                    </Button>

                                    {similarRecommendations.length > 0 && (
                                        <Grid container spacing={3} sx={{ mt: 2 }}>
                                            {similarRecommendations.map((book) => (
                                                <Grid item xs={12} sm={6} md={4} key={book.id}>
                                                    <Paper sx={{ p: 2 }}>
                                                        <Typography variant="h6">{book.title}</Typography>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            {book.authors || 'Автор неизвестен'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {book.description?.slice(0, 100)}...
                                                        </Typography>
                                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                            {book.publish_year && (
                                                                <Chip label={`Год: ${book.publish_year}`} variant="outlined" size="small" />
                                                            )}
                                                            {book.category && (
                                                                <Chip label={book.category.split(',')[0]} variant="outlined" size="small" />
                                                            )}
                                                        </Stack>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </Paper>
                            </Box>
                        </>
                    )}
                </>
            )}
        </Container>
    );
};

export default FavoritesPage;
