// apiClient.js
import axios from 'axios';
import CONFIG from '../config.js';

const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
});

// Interceptor para agregar el token en cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;