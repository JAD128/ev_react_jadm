import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { TicketPriority, TicketStatus } from "../api/tickets";
import { useTickets } from "../api/tickets.queries";

const statusOptions: TicketStatus[] = [
    "ABIERTO",
    "EN_PROCESO",
    "PENDIENTE",
    "RESUELTO",
    "CERRADO",
];

const priorityOptions: TicketPriority[] = ["BAJA", "MEDIA", "ALTA", "CRITICA"];

function formatLabel(value: string) {
    return value
        .replace("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export default function TicketsPage() {
    const { user, logout } = useAuth();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "">("");

    const {
        data: tickets = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useTickets();

    const filteredTickets = useMemo(() => {
        const term = search.trim().toLowerCase();

        return tickets.filter(ticket => {
            const matchesSearch =
                !term ||
                ticket.titulo.toLowerCase().includes(term) ||
                ticket.descripcion.toLowerCase().includes(term) ||
                (ticket.categoriaNombre ?? "").toLowerCase().includes(term) ||
                (ticket.asignadoAUsername ?? "").toLowerCase().includes(term);

            const matchesStatus = !statusFilter || ticket.status === statusFilter;
            const matchesPriority = !priorityFilter || ticket.prioridad === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tickets, search, statusFilter, priorityFilter]);

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
                        <p className="text-sm text-slate-600">Bienvenido: {user?.username}</p>
                    </div>

                    <button
                        onClick={logout}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    >
                        Cerrar sesion
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6">
                <section className="mb-5 grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
                    <input
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por titulo, descripcion, categoria o asignado"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as TicketStatus | "")}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="">Todos los estados</option>
                        {statusOptions.map(status => (
                            <option key={status} value={status}>
                                {formatLabel(status)}
                            </option>
                        ))}
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value as TicketPriority | "")}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="">Todas las prioridades</option>
                        {priorityOptions.map(priority => (
                            <option key={priority} value={priority}>
                                {formatLabel(priority)}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => refetch()}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Actualizar
                    </button>
                </section>

                <div className="mb-3 text-sm text-slate-600">
                    Mostrando {filteredTickets.length} de {tickets.length} tickets
                </div>

                {isLoading && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
                        Cargando tickets...
                    </div>
                )}

                {isError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        No se pudieron cargar los tickets. {error instanceof Error ? error.message : ""}
                    </div>
                )}

                {!isLoading && !isError && filteredTickets.length === 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
                        No hay tickets que coincidan con los filtros.
                    </div>
                )}

                {!isLoading && !isError && filteredTickets.length > 0 && (
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-600">
                                    <tr>
                                        <th className="px-4 py-3">Titulo</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3">Prioridad</th>
                                        <th className="px-4 py-3">Categoria</th>
                                        <th className="px-4 py-3">Asignado</th>
                                        <th className="px-4 py-3">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTickets.map(ticket => (
                                        <tr key={ticket.id} className="hover:bg-slate-50">
                                            <td className="max-w-xs px-4 py-3">
                                                <p className="font-medium text-slate-900">{ticket.titulo}</p>
                                                <p className="truncate text-xs text-slate-500">{ticket.descripcion}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">{formatLabel(ticket.status)}</td>
                                            <td className="px-4 py-3 text-slate-700">{formatLabel(ticket.prioridad)}</td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {ticket.categoriaNombre ?? "Sin categoria"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {ticket.asignadoANombreCompleto ??
                                                    ticket.asignadoAUsername ??
                                                    "Sin asignar"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">{formatDate(ticket.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-3 p-3 md:hidden">
                            {filteredTickets.map(ticket => (
                                <article key={ticket.id} className="rounded-lg border border-slate-200 p-4">
                                    <div className="mb-3">
                                        <h2 className="font-semibold text-slate-900">{ticket.titulo}</h2>
                                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{ticket.descripcion}</p>
                                    </div>

                                    <dl className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <dt className="text-xs font-medium uppercase text-slate-500">Estado</dt>
                                            <dd className="text-slate-800">{formatLabel(ticket.status)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-medium uppercase text-slate-500">Prioridad</dt>
                                            <dd className="text-slate-800">{formatLabel(ticket.prioridad)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-medium uppercase text-slate-500">Categoria</dt>
                                            <dd className="text-slate-800">{ticket.categoriaNombre ?? "Sin categoria"}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-medium uppercase text-slate-500">Asignado</dt>
                                            <dd className="text-slate-800">
                                                {ticket.asignadoANombreCompleto ??
                                                    ticket.asignadoAUsername ??
                                                    "Sin asignar"}
                                            </dd>
                                        </div>
                                        <div className="col-span-2">
                                            <dt className="text-xs font-medium uppercase text-slate-500">Fecha</dt>
                                            <dd className="text-slate-800">{formatDate(ticket.createdAt)}</dd>
                                        </div>
                                    </dl>
                                </article>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
