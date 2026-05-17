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
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setAccessToken(token);
        setUser(userData);
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