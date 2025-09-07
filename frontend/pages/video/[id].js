import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';
import VideoPlayer from '../../components/VideoPlayer';
import CommentSection from '../../components/CommentSection';

export default function VideoPage({ user }) {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchVideo();
    }
  }, [id]);

  const fetchVideo = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/videos`);
      const foundVideo = response.data.find(v => v._id === id);
      
      if (foundVideo) {
        setVideo(foundVideo);
        setLikesCount(foundVideo.likes?.length || 0);
        setLiked(foundVideo.likes?.includes(user?.id) || false);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/videos/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !video) return;

    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/${video.uploader._id}/subscribe`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSubscribed(response.data.subscribed);
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-white">Video not found</h4>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-8">
          <VideoPlayer src={video.url} />
          
          <div className="mt-3">
            <h3 className="text-white">{video.title}</h3>
            
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <h6 className="text-white mb-0">{video.uploader?.username}</h6>
                  <small className="text-light">{video.views} views</small>
                </div>
                
                {user && user.id !== video.uploader?._id && (
                  <button
                    className={`btn ${subscribed ? 'btn-outline-light' : 'btn-gradient'}`}
                    onClick={handleSubscribe}
                  >
                    {subscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                )}
              </div>
              
              <div className="d-flex gap-2">
                <button
                  className={`btn ${liked ? 'btn-gradient' : 'btn-outline-light'}`}
                  onClick={handleLike}
                  disabled={!user}
                >
                  ❤️ {likesCount}
                </button>
                
                <button className="btn btn-outline-light">
                  📤 Share
                </button>
              </div>
            </div>
            
            {video.description && (
              <div className="card card-gradient mt-3">
                <div className="card-body">
                  <p className="text-light mb-0">{video.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="col-lg-4">
          <CommentSection videoId={id} user={user} />
        </div>
      </div>
    </div>
  );
}