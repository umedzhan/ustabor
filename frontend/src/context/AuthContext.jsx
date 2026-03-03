import React, { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const authenticateWithTelegram = async () => {
            try {
                // Determine if we are running inside Telegram
                const initData = WebApp.initData;
                const tgUser = WebApp.initDataUnsafe?.user;

                if (initData && tgUser) {
                    // Send initData to backend for verification and login
                    const response = await axios.post(`${API_URL}/auth/telegram`, {
                        initData: initData,
                        user: tgUser
                    });

                    const { token, user: dbUser } = response.data;
                    setToken(token);
                    setUser(dbUser);
                    localStorage.setItem('token', token);

                    // Setup Axios default header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } else {
                    console.log('Not running inside Telegram. Using Dev User login fallback.');
                    const response = await axios.get(`${API_URL}/auth/dev-login`);
                    const { token, user: devUser } = response.data;
                    setToken(token);
                    setUser(devUser);
                    localStorage.setItem('token', token);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Authentication error:', error);
            } finally {
                setLoading(false);
            }
        };

        authenticateWithTelegram();

        // Setup Telegram WebApp UI options
        WebApp.ready();
        WebApp.expand();
        // WebApp.setHeaderColor('secondary_bg_color');

    }, []);

    const logoutAdmin = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, logoutAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
