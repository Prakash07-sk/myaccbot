import axiosInstance from '../utils/axiosInstance';

export const sendFolderPath = async (folderPath: string) => {
  return axiosInstance.post('/path', { path: folderPath });
};