import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useVideos = (params = {}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [JSON.stringify(params)]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getVideos(params);
      setVideos(data.videos || data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { videos, loading, error, refetch: fetchVideos };
};

export const useVideo = (id) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchVideo();
    }
  }, [id]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getVideo(id);
      setVideo(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { video, loading, error, refetch: fetchVideo };
};

export const useTrending = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTrending();
      setVideos(data.videos || data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { videos, loading, error, refetch: fetchTrending };
};