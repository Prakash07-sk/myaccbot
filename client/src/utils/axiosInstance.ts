import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', // Relative path to backend API
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;