import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketsApi } from "./tickets";
import type { AssignTicketDto, CreateTicketDto } from "./tickets";

export const ticketKeys = {
    all: ["tickets"] as const,
};

export function useTickets() {
    return useQuery({
        queryKey: ticketKeys.all,
        queryFn: ticketsApi.findAll,
    });
}

export function useCreateTicket() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateTicketDto) => ticketsApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ticketKeys.all });
        },
    });
}

export function useAssignTicket() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ticketId, dto }: { ticketId: number; dto: AssignTicketDto }) =>
            ticketsApi.assign(ticketId, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ticketKeys.all });
        },
    });
}
