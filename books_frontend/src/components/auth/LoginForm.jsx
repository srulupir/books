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
        transition: 'border-color 0.2s',
    },
    inputFocus: {
        borderColor: '#007BFF',
        outline: 'none',
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
    error: {
        color: '#d93025',
        textAlign: 'center',
        marginTop: 10,
        fontWeight: 600,
    },
};

const LoginForm = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isButtonHover, setIsButtonHover] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData);
            navigate('/books'); // or '/profile'
        } catch {
            setError('Incorrect username or password');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                    Log In
                </button>
            </form>
            {error && <p style={styles.error}>{error}</p>}
        </div>
    );
};

export default LoginForm;
