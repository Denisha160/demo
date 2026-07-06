import { api } from "./api"

export const UserList = async () => {
    const response = await api.get("/users")
    return {
        data: response.data.users,
        total: response.data.total
    }
}