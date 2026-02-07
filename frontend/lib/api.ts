// lib/api.ts
import axios from "axios";

// 1️⃣ Public API (no token)
export const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 2️⃣ Protected API (with token)
export const protectedApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

protectedApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
