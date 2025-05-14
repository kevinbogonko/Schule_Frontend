import api from "./api";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

let storeAccessToken = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof storeAccessToken === "function"
    ) {
      originalRequest._retry = true;

      try {
        const res = await api.post(
          "/auth/refresh",
          {},
          { withCredentials: true }
        );

        const { user } = res.data;

        // Update user in context
        if (storeAccessToken) {
          storeAccessToken(user);
        }

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed", refreshError);
        if (storeAccessToken) {
          storeAccessToken(null);
        }
        history.push("/login");
      }
    }

    return Promise.reject(error);
  }
);

export const attachAccessTokenSetter = (setter) => {
  storeAccessToken = setter;
};

export default api;
