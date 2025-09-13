import axios from 'axios';
import { API_BASE_URL } from './config';

console.log('AxiosInstance: Configured API_BASE_URL:', API_BASE_URL);
console.log('Vite env:', import.meta.env);
const Axios = axios.create({
  baseURL: API_BASE_URL, // Relative path to backend API
  headers: {
    'Content-Type': 'application/json',
  },
});

export default Axios;