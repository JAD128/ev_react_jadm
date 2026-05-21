import { http } from "./http";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type AuthResponse = {
    token: string;
    username: string;
};
export type LoginDto = {
    username: string;
    password: string;
};
export type RegisterDto = {
    username: string;
    password: string;
};
export const authApi = {
    login: async (dto: LoginDto) => {
        const res = await http<ApiResponse<AuthResponse>>("/api/auth/login",
            { method: "POST", body: JSON.stringify(dto) });
        return res.data;
    },
    register: async (dto: RegisterDto) => {
        const res = await http<ApiResponse<AuthResponse>>("/api/auth/registro",
            { method: "POST", body: JSON.stringify(dto) });
        return res.data;
    },
};
