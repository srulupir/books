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
import BookRecommendation from './BookRecommendation';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', category: '', author: '', year_from: null, year_to: null });
    const [page, setPage] = useState(1);
    const [favorites, setFavorites] = useState(new Set());
    const [genres, setGenres] = useState([]);
    const [snackbar, setSnackbar] = useState(null);
    const { user } = useContext(AuthContext);

    const itemsPerPage = 8;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
            const [booksRes, favoritesRes] = await Promise.all([
                axios.get('/api/books/', { params }),
                user ? axios.get('/api/favorites/') : Promise.resolve({ data: [] })
            ]);

            const loadedBooks = booksRes.data.results || booksRes.data;
            setBooks(loadedBooks);
            setFavorites(new Set(favoritesRes.data.map(fav => fav.book.id)));
            if (!params.category) setGenres(extractGenres(loadedBooks));
        } catch (err) {
            setSnackbar({ message: 'Failed to load data', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [filters, user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const extractGenres = (books) => Array.from(new Set(books.flatMap(b => b.category?.split(',').map(g => g.trim()) || []))).sort();

    const handleFavoriteToggle = async (bookId) => {
        if (!user) return setSnackbar({ message: 'You must be logged in', severity: 'warning' });

        try {
            const isFavorite = favorites.has(bookId);
            await axios[isFavorite ? 'delete' : 'post'](`/api/favorites/${isFavorite ? bookId : ''}`, isFavorite ? null : { book_id: bookId });

            setFavorites(prev => {
                const updated = new Set(prev);
                isFavorite ? updated.delete(bookId) : updated.add(bookId);
                return updated;
            });

            setSnackbar({ message: isFavorite ? 'Removed from favorites' : 'Added to favorites', severity: 'success' });
        } catch {
            setSnackbar({ message: 'Failed to update favorites', severity: 'error' });
        }
    };

    const handleSearch = (e) => setFilters(prev => ({ ...prev, search: e.target.value }));
    const handleFilterChange = (newFilters) => setFilters(prev => ({ ...prev, ...newFilters }));
    const handlePageChange = (_, value) => setPage(value);

    const paginatedBooks = books.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <BookRecommendation />
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField label="Search books" value={filters.search} onChange={handleSearch} variant="outlined" size="small" sx={{ width: 300 }} disabled={loading} />
                <BookFilters genres={genres} onFilter={handleFilterChange} onReset={() => setFilters({ search: '', category: '', author: '', year_from: null, year_to: null })} disabled={loading} />
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
            ) : books.length === 0 ? (
                <Typography align="center">No books found.</Typography>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {paginatedBooks.map(book => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                                <BookCard book={book} isFavorite={favorites.has(book.id)} onFavoriteToggle={handleFavoriteToggle} />
                            </Grid>
                        ))}
                    </Grid>
                    {Math.ceil(books.length / itemsPerPage) > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination count={Math.ceil(books.length / itemsPerPage)} page={page} onChange={handlePageChange} />
                        </Box>
                    )}
                </>
            )}

            <Snackbar open={!!snackbar} autoHideDuration={5000} onClose={() => setSnackbar(null)}>
                <Alert severity={snackbar?.severity}>{snackbar?.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default BookList;
