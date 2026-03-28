import axios from "axios";
import { serverDetails } from "@/config";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: serverDetails.serverProxyURL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers["ngrok-skip-browser-warning"] = "true";

    // Add auth token from cookies if available
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401 && data.code === "unauthorized") {
        Cookies.remove("auth_token");
        Cookies.remove("user_details");
        window.location.href = "/login";
      }
      if (status === 403) {
        return Promise.reject(data);
      }
      if (status === 500) {
        return Promise.reject(data);
      }
      return Promise.reject(data);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
