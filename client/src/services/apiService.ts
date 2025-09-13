import Axios from 'utils/axiosInstance';

export const sendFolderPath = async (folderPath: string) => {
  console.log('ApiService: Sending POST request to /api/path with payload:', { path: folderPath });
  const response = await Axios.post('/api/path', { path: folderPath });
  console.log('ApiService: Response received:', response.data);
  return response;
};

export const sendChatMessage = async (message: {
  conversation_history: Array<any>;
  query: string;
}) => {
  
  try{
    console.log('ApiService: Sending POST request to /api/chat/ with payload:', message);
    console.log('ApiService: Full URL will be:', Axios.defaults.baseURL + '/chat/');
    const response = await Axios.post('/chat/', message);
    console.log('ApiService: Response received:', response);
    if(response && response.data){
      return response.data;
    }
  }
  catch(error){
    console.error('ApiService: Error sending chat message:', error);
    console.error('ApiService: Error details:', error);
    throw error; // Re-throw to let the calling code handle it
  }
  return null;
};

