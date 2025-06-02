import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const styles = {
    container: {
        maxWidth: 420,
        margin: '40px auto',
        padding: 20,
        textAlign: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    toggleText: {
        marginTop: 15,
        fontSize: 14,
        color: '#555',
    },
    toggleButton: {
        background: 'none',
        border: 'none',
        color: '#007BFF',
        cursor: 'pointer',
        textDecoration: 'underline',
        fontSize: 14,
        padding: 0,
        marginLeft: 5,
        fontWeight: 600,
    },
};

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true); // true = login, false = register

    return (
        <div style={styles.container}>
            {isLogin ? (
                <>
                    <LoginForm />
                    <p style={styles.toggleText}>
                        Don't have an account?
                        <button
                            style={styles.toggleButton}
                            onClick={() => setIsLogin(false)}
                        >
                            Register
                        </button>
                    </p>
                </>
            ) : (
                <>
                    <RegisterForm />
                    <p style={styles.toggleText}>
                        Already have an account?
                        <button
                            style={styles.toggleButton}
                            onClick={() => setIsLogin(true)}
                        >
                            Login
                        </button>
                    </p>
                </>
            )}
        </div>
    );
}
