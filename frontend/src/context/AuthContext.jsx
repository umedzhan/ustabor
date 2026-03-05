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
                const initData = WebApp.initData;
                const tgUser = WebApp.initDataUnsafe?.user;

                let loginData;

                if (initData && tgUser) {
                    // Telegram WebApp login
                    const response = await axios.post(`${API_URL}/auth/telegram`, {
                        initData,
                        user: tgUser
                    });
                    loginData = response.data;
                } else {
                    // Dev fallback
                    const response = await axios.get(`${API_URL}/auth/dev-login`);
                    loginData = response.data;
                }

                const { token: newToken, user: authUser } = loginData;

                // Always fetch fresh user from DB to get latest role/onboarded state
                const freshUserRes = await axios.get(`${API_URL}/user/me`, {
                    headers: { Authorization: `Bearer ${newToken}` }
                });
                const freshUser = freshUserRes.data.user;

                setToken(newToken);
                setUser(freshUser);
                localStorage.setItem('token', newToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            } catch (error) {
                console.error('Authentication error:', error);
                // Clear stale token if auth fails
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        authenticateWithTelegram();

        WebApp.ready();
        WebApp.expand();
    }, []);

    const logout = async () => {
        try {
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                await axios.post(`${API_URL}/auth/logout`, {}, {
                    headers: { Authorization: `Bearer ${currentToken}` }
                });
            }
        } catch (err) {
            console.warn('Logout API call failed (non-critical):', err);
        } finally {
            // Clear state
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            // Force full page reload so AuthContext re-runs and fetches fresh user
            window.location.href = '/select-role';
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
