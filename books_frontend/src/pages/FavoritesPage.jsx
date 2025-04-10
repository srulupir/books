import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import RegisterForm from "../components/auth/RegisterForm";

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchFavorites = async () => {
            const { data } = await axios.get('/api/favorites/');
            setFavorites(data);
        };
        if (user) fetchFavorites();
    }, [user]);

    const toggleFavorite = async (bookId) => {
        try {
            if (favorites.some(f => f.id === bookId)) {
                await axios.delete(`/api/favorites/${bookId}/`);
                setFavorites(favorites.filter(f => f.id !== bookId));
            } else {
                await axios.post('/api/favorites/', { book_id: bookId });
                const { data } = await axios.get(`/api/books/${bookId}/`);
                setFavorites([...favorites, data]);
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
        }
    };

    return (
        <div className="favorites">
            <h2>Избранные книги</h2>
            {favorites.length > 0 ? (
                <ul>
                    {favorites.map(book => (
                        <li key={book.id}>
                            <h3>{book.title}</h3>
                            <button onClick={() => toggleFavorite(book.id)}>
                                Удалить из избранного
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>У вас пока нет избранных книг</p>
            )}
        </div>
    );
};

export default FavoritesPage;