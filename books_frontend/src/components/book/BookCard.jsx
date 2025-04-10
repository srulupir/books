import { useState } from 'react';
import RegisterForm from "../auth/RegisterForm.jsx";

const BookCard = ({ book, onFavorite, canFavorite }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    const handleFavoriteClick = () => {
        onFavorite(book.id);
        setIsFavorite(!isFavorite);
    };

    return (
        <div className="book-card">
            <h3>{book.title}</h3>
            <p>{book.authors}</p>
            {canFavorite && (
                <button
                    onClick={handleFavoriteClick}
                    className={isFavorite ? 'favorite active' : 'favorite'}
                >
                    {isFavorite ? '★' : '☆'}
                </button>
            )}
        </div>
    );
};
export default BookCard;