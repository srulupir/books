import React, { useState } from 'react';
import {
    Slider,
    Checkbox,
    TextField,
    FormControlLabel,
    Button,
    Box,
    Typography,
    Collapse
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

const BookFilters = ({ genres = [], onFilter }) => {
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [yearRange, setYearRange] = useState([1900, new Date().getFullYear()]);
    const [authorQuery, setAuthorQuery] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);

    const handleApplyFilters = () => {
        onFilter({
            category: selectedGenres.join(','),
            author: authorQuery,
            year_from: yearRange[0],
            year_to: yearRange[1]
        });
        setFiltersOpen(false);
    };

    const handleResetFilters = () => {
        setSelectedGenres([]);
        setYearRange([1900, new Date().getFullYear()]);
        setAuthorQuery('');
        onFilter({});
        setFiltersOpen(false);
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Button
                startIcon={<FilterListIcon />}
                onClick={() => setFiltersOpen(!filtersOpen)}
                sx={{ mb: 2 }}
            >
                Фильтры
            </Button>

            <Collapse in={filtersOpen}>
                <Box
                    sx={{
                        p: 3,
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        bgcolor: 'background.paper'
                    }}
                >
                    <Typography variant="h6" gutterBottom>Жанры</Typography>
                    <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 3 }}>
                        {genres.map(genre => (
                            <FormControlLabel
                                key={genre}
                                control={
                                    <Checkbox
                                        checked={selectedGenres.includes(genre)}
                                        onChange={() => setSelectedGenres(prev =>
                                            prev.includes(genre)
                                                ? prev.filter(g => g !== genre)
                                                : [...prev, genre]
                                        )}
                                    />
                                }
                                label={genre}
                            />
                        ))}
                    </Box>

                    <Typography variant="h6" gutterBottom>Год выпуска</Typography>
                    <Slider
                        value={yearRange}
                        onChange={(e, newValue) => setYearRange(newValue)}
                        valueLabelDisplay="auto"
                        min={1900}
                        max={new Date().getFullYear()}
                        sx={{ mb: 3 }}
                    />

                    <Typography variant="h6" gutterBottom>Автор</Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Введите имя автора"
                        value={authorQuery}
                        onChange={(e) => setAuthorQuery(e.target.value)}
                        sx={{ mb: 3 }}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleApplyFilters}
                        >
                            Применить
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleResetFilters}
                        >
                            Сбросить
                        </Button>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};

export default BookFilters;