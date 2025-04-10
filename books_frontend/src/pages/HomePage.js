import React from 'react';
import BookRecommendations from '../components/BookRecommendations';

const HomePage = () => {
    return (
        <div className="home-page">
            <h1>Система рекомендаций книг</h1>
            <BookRecommendations />
        </div>
    );
};

export default HomePage;