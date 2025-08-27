import axios from 'axios';
import CONFIG from '../config'

const API_URL = CONFIG.API_BASE_URL;

// Login
const login = async (email, password) => {
    const response = await axios.post(API_URL + 'token/', { email, password });
    
    if (response.data) {
        // Guarda en localStorage
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

// Logout
const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
};

// Refresh token (opcional: para renovar access cuando caduque)
const refresh = async () => {
    const refresh = localStorage.getItem('refresh');
    const response = await axios.post(API_URL + 'token/refresh/', { refresh });
    localStorage.setItem('access', response.data.access);
    return response.data.access;
};

const authService = {
    login,
    logout,
    refresh
};

export default authService;