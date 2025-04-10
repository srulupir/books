import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { searchBooks, addFavorite } from '../api/book';
import BookCard from '../components/book/BookCard';
import SearchForm from '../components/ui/SearchForm';

const BookSearchPage = () => {
    const { user } = useContext(AuthContext);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async (query) => {
        try {
            const data = await searchBooks(query);
            setResults(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleFavorite = async (bookId) => {
        try {
            await addFavorite(bookId);
            // Можно обновить состояние или показать уведомление
        } catch (err) {
            setError('Ошибка добавления в избранное');
        }
    };

    return (
        <div className="book-search-page">
            <SearchForm onSearch={handleSearch} />

            {results && (
                <>
                    <div className="original-book">
                        <BookCard
                            book={results.original_book}
                            onFavorite={handleFavorite}
                            canFavorite={!!user}
                        />
                    </div>

                    <div className="recommendations">
                        {results.results.map(book => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onFavorite={handleFavorite}
                                canFavorite={!!user}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};