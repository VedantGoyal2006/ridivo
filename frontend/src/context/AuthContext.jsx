import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setAccessToken(token);
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            
            // Sync with backend to keep name, phone, pic, and admin status fresh
            axiosInstance.get('/users/profile')
                .then(res => {
                    const freshUser = res.data.user;
                    if (freshUser) {
                        const updated = {
                            ...parsedUser,
                            name: freshUser.name,
                            email: freshUser.email,
                            phone: freshUser.phone,
                            profile_pic: freshUser.profile_pic,
                            is_admin: freshUser.is_admin
                        };
                        localStorage.setItem('user', JSON.stringify(updated));
                        setUser(updated);
                    }
                })
                .catch(err => {
                    console.error('Failed to sync profile on mount:', err);
                });
        }
        setLoading(false);
    }, []);

    const login = (token, userData) => {
        // Decode token to always get fresh is_admin value
        const base64 = token.split('.')[1];
        const decoded = JSON.parse(atob(base64));
        
        const enrichedUser = {
            ...userData,
            is_admin: decoded.is_admin === true || decoded.is_admin === 'true',
        };
        
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(enrichedUser));
        setAccessToken(token);
        setUser(enrichedUser);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setAccessToken(null);
        setUser(null);
    };

    const updateUser = (newUserData) => {
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const updated = { ...currentUser, ...newUserData };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);