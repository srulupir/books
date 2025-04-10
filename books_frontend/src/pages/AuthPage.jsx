// AuthPage.jsx
import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true); // true = login, false = register

    return (
        <div className="auth-container">
            {isLogin ? (
                <>
                    <LoginForm />
                    <p>
                        Нет аккаунта?{' '}
                        <button onClick={() => setIsLogin(false)}>Зарегистрируйтесь</button>
                    </p>
                </>
            ) : (
                <>
                    <RegisterForm />
                    <p>
                        Уже есть аккаунт?{' '}
                        <button onClick={() => setIsLogin(true)}>Войти</button>
                    </p>
                </>
            )}
        </div>
    );
}

