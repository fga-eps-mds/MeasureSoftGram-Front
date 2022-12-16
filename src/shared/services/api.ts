import axios from 'axios';

const api = axios.create({
  baseURL: process.env.SERVICE_URL,
  withCredentials: true
});

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    console.log('token', token);
    if (token && config?.headers) {
      config.headers.Authorization = token ? `Token ${JSON.parse(token)}` : '';
    }
    return config;
  },

  (error) => {
    console.log(error);
  }
);

export default api;
