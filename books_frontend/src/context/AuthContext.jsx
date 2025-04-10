import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import RegisterForm from "../components/auth/RegisterForm.jsx";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        return localStorage.getItem('token');
    });

    // Добавляем интерцептор для axios
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, [token]);

    const fetchUser = useCallback(async () => {
        try {
            // Используем существующий эндпоинт из Django (например, через /api/favorites/)
            const response = await axios.get('/api/favorites/');
            setUser({
                // Преобразуем ответ под вашу структуру пользователя
                username: response.data?.[0]?.user?.username || 'Unknown'
            });
        } catch (err) {
            console.error('Failed to fetch user:', err);
            logout();
        }
    }, []);

    const login = async (credentials) => {
        try {
            const { data } = await axios.post('/api/auth/login/', credentials);
            localStorage.setItem('token', data.access);
            setToken(data.access);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await axios.post('/api/auth/register/', userData);
            localStorage.setItem('token', data.access);
            setToken(data.access);
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        if (token && !user) {
            fetchUser();
        }
    }, [token, user, fetchUser]);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

