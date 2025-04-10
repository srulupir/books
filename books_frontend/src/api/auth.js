import axios from 'axios';

const handleError = (error) => {
    if (error.response) {
        // Сервер ответил с кодом ошибки (4xx, 5xx)
        throw new Error(error.response.data?.detail || error.response.statusText);
    } else if (error.request) {
        // Запрос был сделан, но нет ответа
        throw new Error('Сервер не отвечает');
    } else {
        // Ошибка при настройке запроса
        throw new Error('Ошибка при отправке запроса');
    }
};

export const login = async (credentials) => {
    try {
        const response = await axios.post('/api/login/', credentials, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const register = async (userData) => {
    try {
        const response = await axios.post('/api/register/', userData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};