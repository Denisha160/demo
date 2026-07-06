import { api } from "./api";

interface UserParams {
    limit: number;
    skip: number;
    search: string;
}

export const UserList = async ({
    limit,
    skip,
    search,
}: UserParams) => {
    const url = search
        ? `/users/search?q=${search}&limit=${limit}&skip=${skip}`
        : `/users?limit=${limit}&skip=${skip}`;

    const { data } = await api.get(url);

    return {
        data: data.users,
        total: data.total,
    };
};