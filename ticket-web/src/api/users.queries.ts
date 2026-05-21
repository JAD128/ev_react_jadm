import { useQuery } from "@tanstack/react-query";
import { usersApi } from "./users";

export const userKeys = {
    assignable: ["users", "assignable"] as const,
};

export function useAssignableUsers(enabled: boolean) {
    return useQuery({
        queryKey: userKeys.assignable,
        queryFn: usersApi.findAssignable,
        enabled,
    });
}
