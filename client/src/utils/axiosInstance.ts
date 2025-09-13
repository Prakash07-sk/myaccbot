import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from './config';
import { showError } from './toastUtils';

console.log('AxiosInstance: Configured API_BASE_URL:', API_BASE_URL);
console.log('Vite env:', import.meta.env);

const Axios = axios.create({
  baseURL: API_BASE_URL, // Relative path to backend API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
Axios.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
Axios.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    console.error('Response error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = (error.response.data as any)?.message || error.message;
      
      switch (status) {
        case 400:
          showError(`Bad Request: ${message}`, { title: "Validation Error" });
          break;
        case 401:
          showError("Unauthorized: Please check your credentials", { title: "Authentication Error" });
          break;
        case 403:
          showError("Forbidden: You don't have permission to access this resource", { title: "Access Denied" });
          break;
        case 404:
          showError("Resource not found", { title: "Not Found" });
          break;
        case 500:
          showError("Internal server error. Please try again later.", { title: "Server Error" });
          break;
        case 502:
        case 503:
        case 504:
          showError("Service temporarily unavailable. Please try again later.", { title: "Service Unavailable" });
          break;
        default:
          showError(`Request failed: ${message}`, { title: "Request Error" });
      }
    } else if (error.request) {
      // Network error
      showError("Network error: Please check your internet connection", { title: "Connection Error" });
    } else {
      // Other error
      showError(`Request failed: ${error.message}`, { title: "Request Error" });
    }
    
    return Promise.reject(error);
  }
);

export default Axios;