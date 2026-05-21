import { http } from "./http";

export type TicketStatus =
    | "ABIERTO"
    | "EN_PROCESO"
    | "PENDIENTE"
    | "RESUELTO"
    | "CERRADO";

export type TicketPriority = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type Ticket = {
    id: number;
    titulo: string;
    descripcion: string;
    status: TicketStatus;
    prioridad: TicketPriority;
    categoriaId: number | null;
    categoriaNombre: string | null;
    creadoPorId: number;
    creadoPorUsername: string;
    asignadoAId: number | null;
    asignadoAUsername: string | null;
    asignadoANombreCompleto: string | null;
    createdAt: string;
    updatedAt: string | null;
    closedAt: string | null;
};

export type CreateTicketDto = {
    titulo: string;
    descripcion: string;
    prioridad: TicketPriority;
    categoriaId: number | null;
};

export const ticketsApi = {
    findAll: async () => {
        const res = await http<ApiResponse<Ticket[]>>("/api/tickets");
        return res.data;
    },
    create: async (dto: CreateTicketDto) => {
        const res = await http<ApiResponse<Ticket>>("/api/tickets", {
            method: "POST",
            body: JSON.stringify(dto),
        });
        return res.data;
    },
};
