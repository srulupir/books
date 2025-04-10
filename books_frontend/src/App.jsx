import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import BookSearch from './components/BookSearch/BookSearch.jsx';
import './components/BookSearch/BookSearch.css'
import FavoritesPage from './pages/FavoritesPage';
import AuthPage from './pages/AuthPage'; // Основной компонент для auth
import PrivateRoute from './components/layout/PrivateRoute';
import './pages/AuthPage.css';
import RegisterForm from "./components/auth/RegisterForm.jsx";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<BookSearch/>} />
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