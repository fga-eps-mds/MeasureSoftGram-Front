import axios from 'axios';

const api = axios.create({
  baseURL: '',
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
