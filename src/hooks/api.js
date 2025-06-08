import axios from "axios";

const baseURL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_BACKEND_BASE_URL + "/api"; // Use proxy in development

const API = axios.create({
  baseURL,
  timeout: 10000, // 10s timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials : true,
});

export default API;
