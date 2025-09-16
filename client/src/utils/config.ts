export const API_HOST = import.meta.env.VITE_BACKEND_HOST || 'localhost';
export const API_PORT = import.meta.env.VITE_BACKEND_PORT || '8000'; // Match server port from .env
export const API_ENDPOINT = import.meta.env.VITE_BACKEND_API_ENDPOINT || '/api';
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}${API_ENDPOINT}`;
export const UI_HOSTNAME = import.meta.env.VITE_UI_HOST || 'localhost';
export const UI_PORT_NUMBER = import.meta.env.VITE_UI_PORT || '5173';
export const ENVIRONMENT = import.meta.env.MODE || 'development';
export const PRODUCT_NAME = import.meta.env.VITE_PRODUCT_NAME || 'MyACCOBot';
export const PRODUCT_SUBTITLE = import.meta.env.VITE_PRODUCT_SUBTITLE || 'Financial Assistant';
export const PRODUCT_INPUT_PLACEHOLDER = import.meta.env.VITE_PRODUCT_INPUT_PLACEHOLDER || 'Ask me about your financial data...';

