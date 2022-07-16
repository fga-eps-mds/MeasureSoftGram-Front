import axios from 'axios';

const api = axios.create({
  baseURL: process.env.SERVICE_URL
});

api.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => {
    console.log(error);
  }
);

export default api;
