import { useState } from "react";
import { authApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";
export default function LoginPage({ onSuccess }: { onSuccess: () => void }) {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    // Validación del lado del cliente
    function validate(): string | null {
        if (!username.trim()) return "El usuario es obligatorio.";
        if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
        return null;
    }
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const validationError = validate();
        if (validationError) { setError(validationError); return; }
        setLoading(true);
        setError(null);
        try {
            const res = await authApi.login({ username, password });
            login(res.token, res.username, res.role);
            onSuccess(); // navega a la app
        } catch {
            setError("Credenciales inválidas. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Iniciar sesión</h1>
                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className="block text-sm font-medium mb-1">Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoComplete="username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoComplete="current-password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Ingresando…" : "Ingresar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
