import React from 'react';
import {
    Card,
    CardActionArea,
    CardContent,
    Typography,
    IconButton,
    Chip,
    Box,
    Tooltip,
    Skeleton
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book, isFavorite, onFavoriteToggle, isLoading }) => {
    const navigate = useNavigate();

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        onFavoriteToggle(book.id);
    };

    const handleCardClick = () => {
        if (!isLoading) {
            navigate(`/books/${book.id}`);
        }
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s',
                '&:hover': {
                    transform: isLoading ? 'none' : 'scale(1.02)',
                    boxShadow: isLoading ? 'none' : 3
                },
                opacity: isLoading ? 0.7 : 1
            }}
        >
            <CardActionArea
                onClick={handleCardClick}
                sx={{ flexGrow: 1 }}
                disabled={isLoading}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        {book.title ? (
                            <Typography gutterBottom variant="h6" component="div" noWrap>
                                {book.title}
                            </Typography>
                        ) : (
                            <Skeleton variant="text" width="70%" height={32} />
                        )}

                        <Tooltip title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}>
                            <IconButton
                                aria-label="add to favorites"
                                onClick={handleFavoriteClick}
                                color={isFavorite ? 'error' : 'default'}
                                disabled={isLoading}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                            >
                                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {book.authors ? (
                        <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                            {book.authors || 'Автор не указан'}
                        </Typography>
                    ) : (
                        <Skeleton variant="text" width="60%" />
                    )}

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        {book.publish_year ? (
                            <Chip
                                label={`${book.publish_year}${book.publish_month ? `/${book.publish_month}` : ''}`}
                                size="small"
                            />
                        ) : (
                            <Skeleton variant="rectangular" width={40} height={24} />
                        )}

                        {book.category?.split(',').map((cat, i) => (
                            <Chip
                                key={i}
                                label={cat.trim()}
                                size="small"
                                variant="outlined"
                            />
                        )) || (
                            <Skeleton variant="rectangular" width={60} height={24} />
                        )}
                    </Box>

                    {book.description ? (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {book.description || 'Описание отсутствует'}
                        </Typography>
                    ) : (
                        <>
                            <Skeleton variant="text" />
                            <Skeleton variant="text" />
                            <Skeleton variant="text" width="80%" />
                        </>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default BookCard;