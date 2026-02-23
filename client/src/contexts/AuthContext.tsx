import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { api, setToken } from '../services/api';

interface AuthState {
    isAuthenticated: boolean;
    email: string | null;
}

interface AuthContextValue extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        email: null,
    });

    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
            setToken(savedToken);
            api.getProfile()
                .then((profile) => {
                    setState({ isAuthenticated: true, email: profile.email });
                })
                .catch(() => {
                    localStorage.removeItem(TOKEN_KEY);
                    setToken(null);
                });
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const { token } = await api.login(email, password);
        setToken(token);
        localStorage.setItem(TOKEN_KEY, token);
        setState({ isAuthenticated: true, email });
    }, []);

    const register = useCallback(async (email: string, password: string) => {
        await api.register(email, password);
        const { token } = await api.login(email, password);
        setToken(token);
        localStorage.setItem(TOKEN_KEY, token);
        setState({ isAuthenticated: true, email });
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
        setState({ isAuthenticated: false, email: null });
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
