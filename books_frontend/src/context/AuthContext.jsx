// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// ✅ Хук для удобного использования контекста
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    // ✅ Добавляем интерцептор для axios
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

    // ✅ Функция загрузки информации о пользователе
    const fetchUser = useCallback(async () => {
        try {
            if (!token) return; // Без токена не грузим пользователя

            const response = await axios.get('/api/favorites/');
            setUser({
                username: response.data?.[0]?.user?.username || 'Unknown'
            });
        } catch (err) {
            console.error('Failed to fetch user:', err);
            logout();
        }
    }, [token]);

    // ✅ Вход пользователя
    const login = async (credentials) => {
        try {
            const { data } = await axios.post('/api/auth/login/', credentials);
            localStorage.setItem('token', data.access);
            setToken(data.access);
            await fetchUser();
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // ✅ Регистрация пользователя
    const register = async (userData) => {
        try {
            const { data } = await axios.post('/api/auth/register/', userData);
            localStorage.setItem('token', data.access);
            setToken(data.access);
            await fetchUser();
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    // ✅ Выход пользователя
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }, []);

    // ✅ Автоматическая загрузка пользователя при наличии токена
    useEffect(() => {
        if (token && !user) {
            fetchUser();
        }
    }, [token, user, fetchUser]);

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
