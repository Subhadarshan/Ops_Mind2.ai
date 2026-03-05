import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = '/api/auth';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('opsmind_user');
        return saved ? JSON.parse(saved) : null;
    });

    // Keep a token in memory for protected API calls
    const [token, setToken] = useState(() => localStorage.getItem('opsmind_token') || null);

    // Hydrate user from the /me endpoint on first load (if a token exists)
    useEffect(() => {
        if (!token) return;
        fetch(`${API}/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    const u = { name: data.data.name, email: data.data.email, role: data.data.role };
                    setUser(u);
                    localStorage.setItem('opsmind_user', JSON.stringify(u));
                } else {
                    // Token expired or invalid — clear state
                    _clear();
                }
            })
            .catch(() => _clear());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function _persist(userData, jwtToken) {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('opsmind_user', JSON.stringify(userData));
        localStorage.setItem('opsmind_token', jwtToken);
    }

    function _clear() {
        setUser(null);
        setToken(null);
        localStorage.removeItem('opsmind_user');
        localStorage.removeItem('opsmind_token');
    }

    // ── Login ──────────────────────────────────────────────────────────────
    async function login(email, password) {
        try {
            const res = await fetch(`${API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!data.success) return { success: false, message: data.message || 'Login failed.' };
            const userData = { name: data.data.user.name, email: data.data.user.email, role: data.data.user.role };
            _persist(userData, data.data.token);
            return { success: true, role: data.data.user.role };
        } catch {
            return { success: false, message: 'Network error. Is the server running?' };
        }
    }

    // ── Register (no auto-login — redirects to /login after account creation) ──
    async function register(name, email, password, role) {
        try {
            const res = await fetch(`${API}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });
            const data = await res.json();
            if (!data.success) return { success: false, message: data.message || 'Signup failed.' };
            // DO NOT persist/login — let user log in manually
            return { success: true };
        } catch {
            return { success: false, message: 'Network error. Is the server running?' };
        }
    }

    // ── Logout ─────────────────────────────────────────────────────────────
    function logout() {
        _clear();
    }

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
