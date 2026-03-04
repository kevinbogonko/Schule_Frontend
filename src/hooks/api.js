import axios from "axios";

const baseURL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_BACKEND_BASE_URL + "/api";

const API = axios.create({
  baseURL,
  timeout: 75000, // 15s timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials : true,
});

export default API;