import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
export const WS_URL = 'ws://localhost:3000/ws';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('vehicle_id');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/login', { email, password }),
    register: (data) => api.post('/register', data),
    getProfile: () => api.get('/profile'),
    updateProfile: (data) => api.put('/profile', data),
    deleteAccount: () => api.delete('/profile'),
};

// Vehicle API
export const vehicleAPI = {
    // Driver creates a vehicle for the session/day
    create: (data) => api.post('/vehicles', data),
    // Get details of a specific vehicle
    getById: (id) => api.get(`/vehicles/${id}`),
    // List all vehicles for the driver
    list: () => api.get('/vehicles'),
    // Delete a vehicle
    delete: (id) => api.delete(`/vehicles/${id}`),
};

// GPS/Location API
export const locationAPI = {
    create: (data) => api.post('/gps', data),
};

export default api;
