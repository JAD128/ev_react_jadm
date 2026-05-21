// src/context/AuthContext.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
type AuthRole = "ADMIN" | "TECNICO" | "USUARIO";
type AuthUser = { token: string; username: string; role: AuthRole | null } | null;
type AuthContextType = {
    user: AuthUser;
    login: (token: string, username: string, role?: AuthRole) => void;
    logout: () => void;
};
const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
    // Persistencia: carga token de localStorage al iniciar
    const [user, setUser] = useState<AuthUser>(() => {
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");
        const role = localStorage.getItem("role") as AuthRole | null;
        if (!token || token === "undefined" || token === "null" || !username) {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("role");
            return null;
        }
        return token && username ? { token, username, role } : null;
    });
    function login(token: string, username: string, role?: AuthRole) {
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        if (role) localStorage.setItem("role", role);
        setUser({ token, username, role: role ?? null });
    }
    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
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
