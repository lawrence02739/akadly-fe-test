import { useMutation } from '@tanstack/react-query';
import { getPresignedUploadUrl, uploadToS3 } from '../api/uploads.api';

export const useUpload = () => {
  return useMutation({
    mutationFn: async ({
      file,
      key,
      onProgress,
    }: {
      file: File;
      key: string;
      onProgress?: (progress: number) => void;
    }) => {
      const { uploadUrl, fileUrl } = await getPresignedUploadUrl(key, file.type);
      await uploadToS3(uploadUrl, file, onProgress);
      return fileUrl;
    },
  });
};
