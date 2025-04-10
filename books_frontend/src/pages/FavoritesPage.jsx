import React, { useState, useEffect, useContext } from 'react';
import {
    Grid,
    Card,
    Typography,
    Container,
    CircularProgress,
    Button,
    Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BookCard from '../components/book/BookCard'; // Импортируем ваш компонент карточки книги

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const { data } = await axios.get('/api/favorites/');
                setFavorites(data);
            } catch (error) {
                console.error('Error fetching favorites:', error);
                if (error.response?.status === 401) {
                    // Перенаправляем на страницу входа если не авторизован
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user, navigate]);

    const handleRemoveFavorite = async (bookId) => {
        try {
            await axios.delete(`/api/favorites/${bookId}/`);
            setFavorites(favorites.filter(book => book.id !== bookId));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    if (!user) {
        return (
            <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Для просмотра избранного необходимо авторизоваться
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                    sx={{ mt: 2 }}
                >
                    Войти
                </Button>
            </Container>
        );
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                Мои избранные книги
            </Typography>

            {favorites.length > 0 ? (
                <Grid container spacing={3}>
                    {favorites.map(book => (
                        <Grid item xs={12} sm={6} md={4} key={book.id}>
                            <BookCard
                                book={book}
                                isFavorite={true}
                                onFavoriteToggle={handleRemoveFavorite}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box sx={{
                    textAlign: 'center',
                    p: 4,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2
                }}>
                    <Typography variant="h6" gutterBottom>
                        Ваш список избранного пуст
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Добавляйте книги в избранное, нажимая на значок ♡ в каталоге
                    </Typography>
                    <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/books')}
                    >
                        Перейти к каталогу
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default FavoritesPage;