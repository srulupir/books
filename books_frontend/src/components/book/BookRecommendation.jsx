import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Paper, Grid, Alert } from '@mui/material';
import axios from 'axios';
import BookCard from './BookCard';

const BookRecommendation = () => {
    const [prompt, setPrompt] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [favorites, setFavorites] = useState(new Set());

    const handleRecommend = async () => {
        if (!prompt.trim()) {
            setError('Please enter a description of the book');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');
            setResults([]);

            const response = await axios.post('/api/recommend/', { prompt });
            if (!response.data?.results || !Array.isArray(response.data.results)) {
                throw new Error('Server returned an invalid response format');
            }

            if (response.data.results.length === 0) {
                setSuccess('No recommendations found for your query');
                return;
            }

            const bookIds = response.data.results.map(b => b.id);
            const booksResponse = await axios.get('/api/books/', { params: { ids: bookIds.join(',') } });

            const booksData = Array.isArray(booksResponse.data) ? booksResponse.data : booksResponse.data?.results || [];

            const enrichedResults = response.data.results.map(recommendation => {
                const bookInfo = booksData.find(b => b.id === recommendation.id) || {};
                return { ...bookInfo, ...recommendation };
            });

            setResults(enrichedResults);
            setSuccess(`Found ${enrichedResults.length} recommendations`);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Error occurred while fetching recommendations';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleFavoriteToggle = async (bookId) => {
        try {
            const isFavorite = favorites.has(bookId);
            const method = isFavorite ? 'delete' : 'post';
            const url = isFavorite ? `/api/favorites/${bookId}/` : '/api/favorites/';

            await axios[method](url, isFavorite ? null : { book_id: bookId });

            setFavorites(prev => {
                const newSet = new Set(prev);
                isFavorite ? newSet.delete(bookId) : newSet.add(bookId);
                return newSet;
            });

            setSuccess(isFavorite ? 'Removed from favorites' : 'Added to favorites');
        } catch (err) {
            setError(err.response?.data?.detail || 'Error while updating favorites');
        }
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Smart Book Search
            </Typography>

            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Describe the book you are looking for"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="For example: fantasy with dragons and humor"
                        disabled={loading}
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleRecommend}
                        disabled={loading}
                        sx={{ minWidth: 120, height: 56, width: { xs: '100%', sm: 'auto' } }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Search'}
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {success && !error && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            </Paper>

            {results.length > 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        Recommendations for: "{prompt}"
                    </Typography>
                    <Grid container spacing={3}>
                        {results.map(book => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                                <BookCard
                                    book={book}
                                    showSimilarity={true}
                                    isFavorite={favorites.has(book.id)}
                                    onFavoriteToggle={handleFavoriteToggle}
                                    isLoading={loading}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default BookRecommendation;
