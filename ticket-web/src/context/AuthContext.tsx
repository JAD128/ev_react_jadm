// src/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
type AuthUser = { token: string; username: string } | null;
type AuthContextType = {
    user: AuthUser;
    login: (token: string, username: string) => void;
    logout: () => void;
};
const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
    // Persistencia: carga token de localStorage al iniciar
    const [user, setUser] = useState<AuthUser>(() => {
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");
        return token && username ? { token, username } : null;
    });
    function login(token: string, username: string) {
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        setUser({ token, username });
    }
    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setUser(null);
    }
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
// Hook de acceso rápido
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be inside AuthProvider");
    return ctx;
}