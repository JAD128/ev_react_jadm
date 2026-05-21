import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import type { TicketPriority, TicketStatus } from "../api/tickets";
import { useAssignTicket, useCreateTicket, useTickets } from "../api/tickets.queries";
import { useCategories } from "../api/categories.queries";
import { useAssignableUsers } from "../api/users.queries";

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
    const isAdmin = user?.role === "ADMIN";
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "">("");
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [prioridad, setPrioridad] = useState<TicketPriority>("MEDIA");
    const [categoriaId, setCategoriaId] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    const {
        data: tickets = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useTickets();

    const {
        data: categories = [],
        isLoading: categoriesLoading,
        isError: categoriesError,
    } = useCategories();

    const createTicket = useCreateTicket();
    const assignTicket = useAssignTicket();
    const {
        data: assignableUsers = [],
        isLoading: assignableUsersLoading,
        isError: assignableUsersError,
    } = useAssignableUsers(isAdmin);

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

    async function handleCreateTicket(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        if (!titulo.trim()) {
            setFormError("El titulo es obligatorio.");
            return;
        }

        if (!descripcion.trim()) {
            setFormError("La descripcion es obligatoria.");
            return;
        }

        if (!categoriaId) {
            setFormError("Selecciona una categoria.");
            return;
        }

        try {
            await createTicket.mutateAsync({
                titulo: titulo.trim(),
                descripcion: descripcion.trim(),
                prioridad,
                categoriaId: Number(categoriaId),
            });

            setTitulo("");
            setDescripcion("");
            setPrioridad("MEDIA");
            setCategoriaId("");
            setFormSuccess("Ticket creado correctamente.");
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "No se pudo crear el ticket.");
        }
    }

    async function handleAssignTicket(ticketId: number, tecnicoId: string) {
        if (!tecnicoId) return;

        try {
            await assignTicket.mutateAsync({
                ticketId,
                dto: { tecnicoId: Number(tecnicoId) },
            });
        } catch {
            // La tabla mostrara el error de red si la recarga falla.
        }
    }

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
                <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Crear ticket</h2>
                    </div>

                    {formError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {formError}
                        </div>
                    )}

                    {formSuccess && (
                        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                            {formSuccess}
                        </div>
                    )}

                    <form onSubmit={handleCreateTicket} className="grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Titulo</label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={e => setTitulo(e.target.value)}
                                    maxLength={150}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Prioridad</label>
                                <select
                                    value={prioridad}
                                    onChange={e => setPrioridad(e.target.value as TicketPriority)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    {priorityOptions.map(priority => (
                                        <option key={priority} value={priority}>
                                            {formatLabel(priority)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Descripcion</label>
                            <textarea
                                value={descripcion}
                                onChange={e => setDescripcion(e.target.value)}
                                rows={4}
                                className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Categoria</label>
                                <select
                                    value={categoriaId}
                                    onChange={e => setCategoriaId(e.target.value)}
                                    disabled={categoriesLoading || categoriesError}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                >
                                    <option value="">
                                        {categoriesLoading ? "Cargando categorias..." : "Selecciona una categoria"}
                                    </option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.nombre}
                                        </option>
                                    ))}
                                </select>
                                {categoriesError && (
                                    <p className="mt-1 text-xs text-red-600">No se pudieron cargar las categorias.</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={createTicket.isPending || categoriesLoading}
                                className="self-end rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {createTicket.isPending ? "Creando..." : "Crear ticket"}
                            </button>
                        </div>
                    </form>
                </section>

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
                                                {isAdmin ? (
                                                    <select
                                                        value={ticket.asignadoAId ?? ""}
                                                        onChange={e => handleAssignTicket(ticket.id, e.target.value)}
                                                        disabled={
                                                            assignTicket.isPending ||
                                                            assignableUsersLoading ||
                                                            assignableUsersError
                                                        }
                                                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                                    >
                                                        <option value="">Sin asignar</option>
                                                        {assignableUsers.map(assignableUser => (
                                                            <option key={assignableUser.id} value={assignableUser.id}>
                                                                {assignableUser.nombre} {assignableUser.apellido}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    ticket.asignadoANombreCompleto ??
                                                    ticket.asignadoAUsername ??
                                                    "Sin asignar"
                                                )}
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
                                                {isAdmin ? (
                                                    <select
                                                        value={ticket.asignadoAId ?? ""}
                                                        onChange={e => handleAssignTicket(ticket.id, e.target.value)}
                                                        disabled={
                                                            assignTicket.isPending ||
                                                            assignableUsersLoading ||
                                                            assignableUsersError
                                                        }
                                                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                                    >
                                                        <option value="">Sin asignar</option>
                                                        {assignableUsers.map(assignableUser => (
                                                            <option key={assignableUser.id} value={assignableUser.id}>
                                                                {assignableUser.nombre} {assignableUser.apellido}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    ticket.asignadoANombreCompleto ??
                                                    ticket.asignadoAUsername ??
                                                    "Sin asignar"
                                                )}
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
