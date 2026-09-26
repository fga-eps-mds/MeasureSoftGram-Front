import axios from 'axios';

// NEXT_PUBLIC_API_URL e exposta ao client pelo Next; SERVICE_URL existe so
// no server. Sem fallback, baseURL fica undefined no browser e calls caem
// no proprio dominio do front (404).
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.SERVICE_URL,
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
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Limpa todos os dados de autenticação armazenados
        localStorage.removeItem('token');
        localStorage.removeItem('session');
        localStorage.removeItem('provider');
        localStorage.removeItem('login_timestamp');

        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
