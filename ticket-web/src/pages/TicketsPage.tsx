import { useAuth } from "../context/AuthContext";

export default function TicketsPage() {
    const { user, logout } = useAuth();

    return (
        <div>
            <h1>Tickets</h1>

            <p>Bienvenido: {user?.username}</p>

            <button onClick={logout}>
                Cerrar sesión
            </button>
        </div>
    );
}