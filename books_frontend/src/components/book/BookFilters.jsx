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

const BookFilters = ({ genres = [], onFilter, onReset, disabled }) => {
    const [open, setOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        category: [],
        author: '',
        year_from: 1900,
        year_to: new Date().getFullYear()
    });

    const handleApply = () => {
        onFilter({
            category: localFilters.category.join(','),
            author: localFilters.author,
            year_from: localFilters.year_from,
            year_to: localFilters.year_to
        });
        setOpen(false);
    };

    const handleReset = () => {
        setLocalFilters({
            category: [],
            author: '',
            year_from: 1900,
            year_to: new Date().getFullYear()
        });
        onReset();
        setOpen(false);
    };

    return (
        <Box>
            <Button
                startIcon={<FilterListIcon />}
                onClick={() => setOpen(!open)}
                disabled={disabled}
            >
                Filters
            </Button>

            <Collapse in={open}>
                <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 1, mt: 1 }}>
                    <Typography variant="h6" gutterBottom>Genres</Typography>
                    <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 3 }}>
                        {genres.map(genre => (
                            <FormControlLabel
                                key={genre}
                                control={
                                    <Checkbox
                                        checked={localFilters.category.includes(genre)}
                                        onChange={() => setLocalFilters(prev => ({
                                            ...prev,
                                            category: prev.category.includes(genre)
                                                ? prev.category.filter(g => g !== genre)
                                                : [...prev.category, genre]
                                        }))}
                                        disabled={disabled}
                                    />
                                }
                                label={genre}
                            />
                        ))}
                    </Box>

                    <Typography variant="h6" gutterBottom>Year of publish</Typography>
                    <Slider
                        value={[localFilters.year_from, localFilters.year_to]}
                        onChange={(_, newValue) => setLocalFilters(prev => ({
                            ...prev,
                            year_from: newValue[0],
                            year_to: newValue[1]
                        }))}
                        valueLabelDisplay="auto"
                        min={1900}
                        max={new Date().getFullYear()}
                        sx={{ mb: 3 }}
                        disabled={disabled}
                    />

                    <Typography variant="h6" gutterBottom>Author</Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        value={localFilters.author}
                        onChange={(e) => setLocalFilters(prev => ({
                            ...prev,
                            author: e.target.value
                        }))}
                        sx={{ mb: 3 }}
                        disabled={disabled}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleApply}
                            disabled={disabled}
                        >
                            Apply
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleReset}
                            disabled={disabled}
                        >
                            Reset
                        </Button>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};

export default BookFilters;
