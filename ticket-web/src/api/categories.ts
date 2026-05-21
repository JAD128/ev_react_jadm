import { http } from "./http";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type Category = {
    id: number;
    nombre: string;
    descripcion: string | null;
    createdAt: string;
};

export const categoriesApi = {
    findAll: async () => {
        const res = await http<ApiResponse<Category[]>>("/api/categorias");
        return res.data;
    },
};
