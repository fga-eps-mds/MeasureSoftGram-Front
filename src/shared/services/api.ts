import axios from 'axios';

const api = axios.create({
  baseURL: process.env.SERVICE_URL,
  withCredentials: true
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('Token obtido do localStorage:', token);

      if (token && config?.headers) {
        config.headers.Authorization = token ? `Token ${JSON.parse(token)}` : '';
        console.log('Headers após adicionar o token:', config.headers);
      }
    }
    return config;
  },

  (error) => {
    console.log('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

export default api;
