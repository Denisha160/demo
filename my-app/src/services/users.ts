import { api } from "./api";
import type { UserListResponse } from "../hooks/index"

export const UserList = async (): Promise<UserListResponse> => {
    const response = await api.get("/users");

    return {
        data: response.data.users,
        total: response.data.total,
    };
};