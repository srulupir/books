import React, { useState } from 'react';
import axios from 'axios';

const styles = {
    container: {
        maxWidth: 900,
        margin: '40px auto',
        padding: 30,
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    title: {
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    form: {
        display: 'flex',
        gap: 10,
        marginBottom: 30,
    },
    input: {
        flex: 1,
        padding: '12px 15px',
        fontSize: 16,
        border: '1px solid #ccc',
        borderRadius: 5,
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    },
    inputFocus: {
        borderColor: '#007BFF',
        outline: 'none',
    },
    button: {
        padding: '12px 25px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: 5,
        cursor: 'pointer',
        fontSize: 16,
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
    errorBox: {
        padding: 15,
        backgroundColor: '#ffebee',
        color: '#d93025',
        marginBottom: 25,
        borderRadius: 5,
        borderLeft: '4px solid #f44336',
    },
    resultBookContainer: {
        backgroundColor: '#f5f5f5',
        padding: 20,
        borderRadius: 8,
        marginBottom: 30,
    },
    resultBookTitle: {
        marginTop: 0,
    },
    resultBookAuthors: {
        fontSize: 18,
        margin: '10px 0',
    },
    recommendedTitle: {
        borderBottom: '2px solid #4CAF50',
        paddingBottom: 8,
        color: '#333',
    },
    recommendationsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20,
        marginTop: 20,
    },
    recommendationCard: {
        backgroundColor: '#f5f5f5',
        padding: 20,
        borderRadius: 8,
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    },
    recommendationTitle: {
        marginTop: 0,
        marginBottom: 10,
    },
    recommendationAuthors: {
        margin: '8px 0',
        color: '#555',
    },
    similarityBadge: {
        backgroundColor: '#007BFF',
        color: 'white',
        padding: '5px 10px',
        borderRadius: 4,
        display: 'inline-block',
        fontSize: 14,
    },
    emptyState: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666',
        fontSize: 18,
    },
};

const BookSearch = () => {
    const [query, setQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            setError('Please enter a search query');
            return;
        }

        setLoading(true);
        setError('');
        setSearchResult(null);

        try {
            const response = await axios.get('/api/search/', {
                params: { q: trimmedQuery },
            });

            if (!response.data?.original_book || !Array.isArray(response.data?.results)) {
                throw new Error('Invalid response structure from server');
            }

            setSearchResult(response.data);
        } catch (err) {
            const apiError = err.response?.data?.error;
            if (apiError) {
                setError(apiError);
            } else {
                setError(err.message || 'Error occurred during the request');
            }
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Book Search & Recommendations</h1>

            <form onSubmit={handleSearch} style={styles.form}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter book title"
                    style={styles.input}
                    disabled={loading}
                />
                <button
                    type="submit"
                    style={{
                        ...styles.button,
                        ...(loading || !query.trim() ? styles.buttonDisabled : {}),
                    }}
                    disabled={loading || !query.trim()}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <div style={styles.errorBox}><strong>Error:</strong> {error}</div>}

            {searchResult && (
                <div>
                    <div style={styles.resultBookContainer}>
                        <h2 style={styles.resultBookTitle}>Found book: {searchResult.original_book.title}</h2>
                        <p style={styles.resultBookAuthors}>
                            <strong>Author(s):</strong> {searchResult.original_book.authors}
                        </p>

                    </div>

                    <h3 style={styles.recommendedTitle}>
                        Recommended Books ({searchResult.results.length})
                    </h3>

                    <div style={styles.recommendationsGrid}>
                        {searchResult.results.map((book) => (
                            <div key={book.id} style={styles.recommendationCard}>
                                <h4 style={styles.recommendationTitle}>{book.title}</h4>
                                <p style={styles.recommendationAuthors}>
                                    <strong>Author(s):</strong> {book.authors}
                                </p>
                                <div style={styles.similarityBadge}>Similarity: {book.similarity}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!searchResult && !loading && !error && (
                <div style={styles.emptyState}>
                    Enter a book title to search and get recommendations
                </div>
            )}
        </div>
    );
};

export default BookSearch;
