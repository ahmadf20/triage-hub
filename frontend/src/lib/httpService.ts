import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const httpService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

httpService.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here if needed
    return Promise.reject(error);
  },
);
