import axios from 'axios';

const api = axios.create({
  baseURL: process.env.SERVICE_URL,
  withCredentials: true
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      if (token && config?.headers) {
        config.headers.Authorization = token ? `Token ${JSON.parse(token)}` : '';
      }
    }
    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

export default api;
