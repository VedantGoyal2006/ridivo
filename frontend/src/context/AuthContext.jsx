import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user has visual profile saved locally
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
        }
        
        // Always sync with backend on mount using HttpOnly cookie (verifies session state)
        axiosInstance.get('/users/profile')
            .then(res => {
                const freshUser = res.data.user;
                if (freshUser) {
                    localStorage.setItem('user', JSON.stringify(freshUser));
                    setUser(freshUser);
                } else {
                    localStorage.removeItem('user');
                    setUser(null);
                }
            })
            .catch(err => {
                console.error('Failed to sync profile on mount (unauthorized/expired):', err);
                localStorage.removeItem('user');
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/auth/logout');
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const updateUser = (newUserData) => {
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const updated = { ...currentUser, ...newUserData };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);