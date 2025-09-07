import { useState } from 'react';
import apiService from '../services/api';

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadVideo = async (videoData) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append('video', videoData.file);
      formData.append('title', videoData.title);
      formData.append('description', videoData.description);
      formData.append('category', videoData.category);
      if (videoData.tags) {
        formData.append('tags', videoData.tags);
      }
      if (videoData.thumbnail) {
        formData.append('thumbnail', videoData.thumbnail);
      }

      const response = await apiService.uploadVideo(formData, (progressValue) => {
        setProgress(progressValue);
      });

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadVideo,
    uploading,
    progress,
    error
  };
};