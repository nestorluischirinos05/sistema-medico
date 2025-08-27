/*import axios from 'axios';

// Configura la URL base de tu API Django
const API = axios.create({
    baseURL: 'http://localhost:8000/api/',
});

// Interceptor: agrega el token a cada petición
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
});

export default API;
*/
/*import axios from 'axios';

// Obtener el token del localStorage
const getToken = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).access : null;
};

// Configurar la instancia de axios
const API = axios.create({
  baseURL: 'http://localhost:8000/api/', // Ajusta si es necesario
});

// Interceptor para agregar el token en cada solicitud
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;*/
// src/services/api.js
import axios from 'axios';
import CONFIG from '../config';
// Obtener el token del localStorage
const getToken = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).access : null;
};

// Configurar la instancia de axios
const API = axios.create({
  baseURL: CONFIG.API_BASE_URL, // Ajusta si es necesario
});

// Interceptor para agregar el token en cada solicitud
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
