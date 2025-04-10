// src/components/auth/LoginForm.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData);
            navigate('/books'); // или '/profile'
        } catch (err) {
            setError('Неверный логин или пароль');
        }
    };

    return (
        <div className="auth-form">
            <h2>Вход</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button type="submit">Войти</button>
            </form>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
    );
};

export default LoginForm;
