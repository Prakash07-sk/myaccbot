import Axios from "@/utils/axiosInstance";
import { showSuccess, showError } from "@/utils/toastUtils";

export const BrowseDeviceAPI = async(payload: {
    path: string
}) => {
    try{
        const response = await Axios.post('/source/device', payload);
        showSuccess('Data successfully added to database');
        return {
            success: true,
            data: response?.data,
            message: 'Data successfully added to database'
        };
    }
    catch(error: any){
        console.error('Error browsing device:', error);
        // Error toast is already handled by axios interceptor
        return {
            success: false,
            data: null,
            message: error?.response?.data?.message || 'Failed to add data to database'
        };
    }
}


export const GoogleDriveAPI = async(payload: {
    path: string
}) => {
    try{
        const response = await Axios.post('/source/google_drive', payload);
        showSuccess('Google Drive data successfully added to database');
        return {
            success: true,
            data: response?.data,
            message: 'Google Drive data successfully added to database'
        };
    }
    catch(error: any){
        console.error('Error browsing google drive:', error);
        // Error toast is already handled by axios interceptor
        return {
            success: false,
            data: null,
            message: error?.response?.data?.message || 'Failed to add Google Drive data to database'
        };
    }
}