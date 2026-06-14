// frontend/src/utils/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL   // ← this will be set on Vercel
});

// Add token automatically (if you already have this logic, keep it)
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('propertyBazzarUser');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default API;