import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { UserList } from "../services/users";

export const useGetUsers = (
    limit: number,
    skip: number,
    search: string
) => {
    return useQuery({
        queryKey: ["users", limit, skip, search],
        queryFn: () => UserList({ limit, skip, search }),
        placeholderData: keepPreviousData,
    });
};