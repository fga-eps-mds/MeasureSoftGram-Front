import axios from 'axios';

const api = axios.create({
  baseURL: process.env.SERVICE_URL
});

api.interceptors.request.use(
  async (response) => {
    return response;
  },
  (error) => {
    console.log(error);
  }
);

export default api;
