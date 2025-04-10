import React, { useState } from 'react';
import axios from 'axios';


const BookSearch = () => {
    const [query, setQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            setError('Введите поисковый запрос');
            return;
        }

        setLoading(true);
        setError('');
        setSearchResult(null);

        try {
            const response = await axios.get('/api/search/', {
                params: { q: trimmedQuery }
            });

            // Проверяем структуру ответа согласно вашему API
            if (!response.data?.original_book || !Array.isArray(response.data?.results)) {
                throw new Error('Некорректная структура ответа сервера');
            }

            setSearchResult(response.data);
        } catch (err) {
            // Обрабатываем разные типы ошибок API
            const apiError = err.response?.data?.error;
            if (apiError) {
                setError(apiError);
            } else {
                setError(err.message || 'Ошибка при выполнении запроса');
            }
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
                Поиск книг и рекомендаций
            </h1>

            <form
                onSubmit={handleSearch}
                style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '30px'
                }}
            >
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Введите название книги"
                    style={{
                        flex: 1,
                        padding: '12px 15px',
                        fontSize: '16px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}
                    disabled={loading}
                />
                <button
                    type="submit"
                    style={{
                        padding: '12px 25px',
                        background: loading ? '#ccc' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                    disabled={loading || !query.trim()}
                >
                    {loading ? 'Поиск...' : 'Найти'}
                </button>
            </form>

            {/* Блок ошибок */}
            {error && (
                <div style={{
                    padding: '15px',
                    background: '#ffebee',
                    color: '#d32f2f',
                    marginBottom: '25px',
                    borderRadius: '4px',
                    borderLeft: '4px solid #f44336'
                }}>
                    <strong>Ошибка:</strong> {error}
                </div>
            )}

            {/* Результаты поиска */}
            {searchResult && (
                <div style={{ marginTop: '30px' }}>
                    <div style={{
                        background: '#e8f5e9',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '30px'
                    }}>
                        <h2 style={{ marginTop: 0 }}>
                            Найдена книга: {searchResult.original_book.title}
                        </h2>
                        <p style={{ fontSize: '18px', margin: '10px 0' }}>
                            <strong>Автор(ы):</strong> {searchResult.original_book.authors}
                        </p>
                    </div>

                    <h3 style={{ borderBottom: '2px solid #4CAF50', paddingBottom: '8px' }}>
                        Рекомендуемые книги ({searchResult.results.length})
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px',
                        marginTop: '20px'
                    }}>
                        {searchResult.results.map(book => (
                            <div
                                key={book.id}
                                style={{
                                    background: '#f5f5f5',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}
                            >
                                <h4 style={{ marginTop: 0, marginBottom: '10px' }}>
                                    {book.title}
                                </h4>
                                <p style={{ margin: '8px 0', color: '#555' }}>
                                    <strong>Автор(ы):</strong> {book.authors}
                                </p>
                                <div style={{
                                    background: '#4CAF50',
                                    color: 'white',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    display: 'inline-block',
                                    fontSize: '14px'
                                }}>
                                    Сходство: {book.similarity}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Состояние пустого поиска */}
            {!searchResult && !loading && !error && (
                <div style={{
                    textAlign: 'center',
                    marginTop: '50px',
                    color: '#666'
                }}>
                    <p style={{ fontSize: '18px' }}>
                        Введите название книги для поиска и получения рекомендаций
                    </p>
                </div>
            )}
        </div>
    );
};

export default BookSearch;