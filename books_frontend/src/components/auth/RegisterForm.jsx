import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const styles = {
    container: {
        maxWidth: 400,
        margin: '40px auto',
        padding: 30,
        border: '1px solid #ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '12px 15px',
        marginBottom: 15,
        border: '1px solid #ccc',
        borderRadius: 5,
        fontSize: 16,
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '12px 0',
        fontSize: 18,
        fontWeight: 600,
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: 5,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    buttonHover: {
        backgroundColor: '#0056b3',
    },
};

const RegisterForm = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [isButtonHover, setIsButtonHover] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await register(formData);
        navigate('/profile');
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Register</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    style={styles.input}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={styles.input}
                />
                <button
                    type="submit"
                    style={isButtonHover ? { ...styles.button, ...styles.buttonHover } : styles.button}
                    onMouseEnter={() => setIsButtonHover(true)}
                    onMouseLeave={() => setIsButtonHover(false)}
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;
