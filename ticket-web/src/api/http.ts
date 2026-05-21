export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

function getValidToken() {
    const token = localStorage.getItem("token");

    if (!token || token === "undefined" || token === "null") {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        return null;
    }

    return token;
}

export async function http<T>(path: string, options?: RequestInit): Promise<T> {
    // Lee el token guardado
    const token = getValidToken();
    const res = await fetch(`${API_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            // Agrega el header solo si existe token
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            ...(options?.headers ?? {}),
        },
        ...options,
    });
    // Si el servidor responde 401, el token expiró → limpiar sesión
    if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "/login";
        throw new Error("Sesión expirada");
    }
    if (!res.ok) {
        const text = await res.text();
        let message = text;

        try {
            const body = JSON.parse(text) as { message?: string };
            message = body.message ?? text;
        } catch {
            message = text;
        }

        throw new Error(message || `HTTP ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}
