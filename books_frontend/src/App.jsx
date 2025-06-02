import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import BookSearch from './components/BookSearch/BookSearch.jsx';
import FavoritesPage from './pages/FavoritesPage';
import AuthPage from './pages/AuthPage'; // Основной компонент для auth
import PrivateRoute from './components/layout/PrivateRoute';
//import './pages/AuthPage.css';
import RegisterForm from "./components/auth/RegisterForm.jsx";
import React from 'react';
//import './App.css';
import BookList from './components/book/BookList';  // Импорт компонента для списка книг
import Header from './components/layout/Header';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/" element={<BookSearch />} />
                    <Route path="/books" element={<BookList />} /> {/* Новый маршрут для списка книг */}
                    <Route path="/auth/*" element={<AuthPage />} /> {/* Внутри AuthPage будет переключение между формами */}
                    <Route path="/favorites" element={
                        <PrivateRoute>
                            <FavoritesPage />
                        </PrivateRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
