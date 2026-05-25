import { createContext, useContext, useState, useEffect } from 'react';

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
            setUser(JSON.parse(savedUser));
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

    return (
        <AuthContext.Provider value={{ user, accessToken, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);