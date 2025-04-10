import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * Компонент для защиты маршрутов
 * - Перенаправляет неавторизованных пользователей на /auth
 * - Дочерние элементы (страницы) рендерятся только при авторизации
 */
const PrivateRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        // Сохраняем запрашиваемый путь для редиректа после входа
        return <Navigate to="/auth" replace state={{ from: location }} />;
    }

    // Можно использовать Outlet для вложенных роутов или children
    return children ? children : <Outlet />;
};

export default PrivateRoute;