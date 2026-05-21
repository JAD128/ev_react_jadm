import { http } from "./http";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type UserRole = "ADMIN" | "TECNICO" | "USUARIO";

export type AppUser = {
    id: number;
    username: string;
    email: string;
    nombre: string;
    apellido: string;
    role: UserRole;
    enabled: boolean;
    createdAt: string;
};

export const usersApi = {
    findAssignable: async () => {
        const [tecnicos, admins] = await Promise.all([
            http<ApiResponse<AppUser[]>>("/api/usuarios/rol/TECNICO"),
            http<ApiResponse<AppUser[]>>("/api/usuarios/rol/ADMIN"),
        ]);

        return [...tecnicos.data, ...admins.data].filter(user => user.enabled);
    },
};
