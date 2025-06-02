import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    Menu,
    MenuItem,
    IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const isAuthenticated = false; // Replace with actual authentication logic

    return (
        <AppBar position="static" sx={{ mb: 4 }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        noWrap
                        component={Link}
                        to="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        BOOKSTORE
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        <Button component={Link} to="/books" sx={{ my: 2, color: 'white' }}>
                            Books
                        </Button>
                        <Button component={Link} to="/favorites" sx={{ my: 2, color: 'white' }}>
                            Favorites
                        </Button>
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        {isAuthenticated ? (
                            <>
                                <IconButton
                                    size="large"
                                    aria-label="account of current user"
                                    onClick={handleProfileMenuOpen}
                                    color="inherit"
                                >
                                    <AccountCircle />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={isMenuOpen}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>Profile</MenuItem>
                                    <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Button component={Link} to="/auth" variant="outlined" sx={{ color: 'white', borderColor: 'white' }}>
                                Sign In
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;
