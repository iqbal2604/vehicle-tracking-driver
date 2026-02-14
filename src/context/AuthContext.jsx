import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const response = await authAPI.getProfile();
            setUser(response.data.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await authAPI.login(email, password);
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        return response;
    };

    const register = async (userData) => {
        const response = await authAPI.register(userData);
        // Automatically login after successful registration
        return login(userData.email, userData.password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('vehicle_id'); // Clear active vehicle on logout
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
