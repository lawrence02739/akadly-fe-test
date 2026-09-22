import axios from 'axios';
import api from '../../../shared/api/axios';

export const getPresignedUploadUrl = async (key: string, contentType: string): Promise<{ uploadUrl: string, fileUrl: string, fileKey: string }> => {
  const { data } = await api.post('/uploads/presign', { key, contentType });
  return data.data; // Unwrap the standardized API response envelope
};

export const uploadToS3 = async (uploadUrl: string, file: File, onProgress?: (progress: number) => void): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
};
