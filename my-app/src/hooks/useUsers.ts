import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { UserList } from "../services/users";

export interface User {
    id: number;
    firstName: string;
    email: string;
    phone: string;
}

export interface UserListResponse {
    data: User[];
    total: number;
}


export const useGetUsers = () => {
    return useQuery<UserListResponse, Error>({
        queryKey: ['users'],
        queryFn: UserList,
        placeholderData: keepPreviousData
    })
}