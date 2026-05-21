import { useAuth } from "../context/AuthContext";

type Props = {
    children: React.ReactNode;
    fallback: React.ReactNode; // qué mostrar si no hay sesión
};

export default function PrivateRoute({ children, fallback }: Props) {
    const { user } = useAuth();
    return user ? <>{children}</> : <>{fallback}</>;
}
