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
            elevation={4}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                cursor: isLoading ? 'default' : 'pointer',
                '&:hover': {
                    transform: isLoading ? 'none' : 'translateY(-6px) scale(1.03)',
                    boxShadow: isLoading ? 'none' : '0 8px 20px rgba(0,0,0,0.12)',
                },
                opacity: isLoading ? 0.6 : 1,
                backgroundColor: '#fff',
            }}
        >
            <CardActionArea
                onClick={handleCardClick}
                sx={{ flexGrow: 1, padding: 2 }}
                disabled={isLoading}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    {book.title ? (
                        <Typography
                            variant="h6"
                            component="h3"
                            noWrap
                            sx={{
                                fontWeight: 700,
                                color: '#222',
                                userSelect: 'none',
                            }}
                        >
                            {book.title}
                        </Typography>
                    ) : (
                        <Skeleton variant="text" width="70%" height={32} />
                    )}

                    <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                        <IconButton
                            aria-label="toggle favorite"
                            onClick={handleFavoriteClick}
                            color={isFavorite ? 'error' : 'default'}
                            disabled={isLoading}
                            sx={{
                                transition: 'background-color 0.3s',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                }
                            }}
                        >
                            {isFavorite ? <FavoriteIcon fontSize="medium" /> : <FavoriteBorderIcon fontSize="medium" />}
                        </IconButton>
                    </Tooltip>
                </Box>

                {book.authors ? (
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                        noWrap
                        sx={{ fontStyle: 'italic' }}
                    >
                        {book.authors || 'Author unknown'}
                    </Typography>
                ) : (
                    <Skeleton variant="text" width="60%" />
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                    {book.publish_year ? (
                        <Chip
                            label={`${book.publish_year}${book.publish_month ? `/${book.publish_month}` : ''}`}
                            size="small"
                            color="primary"
                            variant="filled"
                            sx={{ fontWeight: 600 }}
                        />
                    ) : (
                        <Skeleton variant="rectangular" width={48} height={28} />
                    )}

                    {book.category?.split(',').map((cat, i) => (
                        <Chip
                            key={i}
                            label={cat.trim()}
                            size="small"
                            variant="outlined"
                            sx={{
                                borderColor: '#90caf9',
                                color: '#1976d2',
                                fontWeight: 500,
                            }}
                        />
                    )) || (
                        <Skeleton variant="rectangular" width={80} height={28} />
                    )}
                </Box>

                {book.description ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                            userSelect: 'text',
                        }}
                    >
                        {book.description || 'Description not available'}
                    </Typography>
                ) : (
                    <>
                        <Skeleton variant="text" />
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="80%" />
                    </>
                )}
            </CardActionArea>
        </Card>
    );
};

export default BookCard;
