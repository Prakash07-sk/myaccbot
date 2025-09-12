import axiosInstance from '../utils/axiosInstance';

export const sendFolderPath = async (folderPath: string) => {
  console.log('ApiService: Sending POST request to /api/path with payload:', { path: folderPath });
  const response = await axiosInstance.post('/api/path', { path: folderPath });
  console.log('ApiService: Response received:', response.data);
  return response;
};

export const sendChatMessage = async (message: string) => {
  console.log('ApiService: Sending POST request to /api/chat with payload:', { message });
  const response = await axiosInstance.post('/api/chat', { message });
  console.log('ApiService: Chat response received:', response.data);
  return response;
};