// frontend/src/api/axios.js
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001/api' });

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('agriapp:user');
  if (raw) {
    const user = JSON.parse(raw);
    if (user?._id) config.headers['x-user-id'] = user._id;
  }
  return config;
});

export default api;
