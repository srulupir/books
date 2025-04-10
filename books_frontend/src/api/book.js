import axios from 'axios';

axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const searchBooks = async (query) => {
    const response = await axios.get('/api/search/', { params: { q: query } });
    return response.data;
};

export const addFavorite = async (bookId) => {
    await axios.post('/api/favorites/', { book_id: bookId });
};

export const removeFavorite = async (bookId) => {
    await axios.delete(`/api/favorites/${bookId}/`);
};

export const getFavorites = async () => {
    const response = await axios.get('/api/favorites/');
    return response.data;
};