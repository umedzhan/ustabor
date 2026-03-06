import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Core auth function — reusable after logout
    const authenticate = useCallback(async () => {
        setLoading(true);
        try {
            const initData = WebApp.initData;
            const tgUser = WebApp.initDataUnsafe?.user;

            let newToken;

            if (initData && tgUser) {
                // Real Telegram WebApp
                const res = await axios.post(`${API_URL}/auth/telegram`, {
                    initData,
                    user: tgUser
                });
                newToken = res.data.token;
            } else {
                // Browser dev fallback
                const res = await axios.get(`${API_URL}/auth/dev-login`);
                newToken = res.data.token;
            }

            // Always fetch FRESH user from DB (not JWT payload which may be stale)
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            const freshRes = await axios.get(`${API_URL}/user/me`);
            const freshUser = freshRes.data.user;

            setToken(newToken);
            setUser(freshUser);
            localStorage.setItem('token', newToken);

        } catch (err) {
            console.error('Auth error:', err);
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        WebApp.ready();
        WebApp.expand();
        authenticate();
    }, [authenticate]);

    const logout = async (navigateFn) => {
        try {
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                await axios.post(`${API_URL}/auth/logout`, {}, {
                    headers: { Authorization: `Bearer ${currentToken}` }
                });
            }
        } catch (err) {
            console.warn('Logout API failed (non-critical):', err);
        }

        // Clear state immediately
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];

        // Navigate FIRST so SelectRole renders with loading=true
        if (navigateFn) navigateFn('/select-role', { replace: true });

        // Then re-authenticate in-place (gets fresh user with role='none')
        await authenticate();
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, setToken, loading, logout, authenticate }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
