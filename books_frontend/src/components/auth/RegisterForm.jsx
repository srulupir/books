import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await register(formData);
        navigate('/profile');
    };

    return (
        <div className="auth-form">
            <h2>Регистрация</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    );
};
export default RegisterForm;
