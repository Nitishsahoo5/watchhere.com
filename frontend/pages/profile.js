import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import VideoCard from '../components/VideoCard';

export default function ProfilePage({ user }) {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('uploaded');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-white">Please login to view profile</h4>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card card-gradient mb-4">
        <div className="card-body text-center">
          <div className="mb-3">
            <div
              className="rounded-circle bg-gradient d-inline-flex align-items-center justify-content-center"
              style={{ width: '100px', height: '100px', fontSize: '2rem' }}
            >
              👤
            </div>
          </div>
          
          <h3 className="text-white">{profile?.user?.username}</h3>
          <p className="text-light">{profile?.user?.email}</p>
          
          <div className="row text-center mt-4">
            <div className="col-4">
              <h5 className="text-white">{profile?.uploadedVideos?.length || 0}</h5>
              <small className="text-light">Videos</small>
            </div>
            <div className="col-4">
              <h5 className="text-white">{profile?.subscribersCount || 0}</h5>
              <small className="text-light">Subscribers</small>
            </div>
            <div className="col-4">
              <h5 className="text-white">{profile?.user?.subscriptions?.length || 0}</h5>
              <small className="text-light">Subscriptions</small>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <ul className="nav nav-pills justify-content-center">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'uploaded' ? 'btn-gradient' : 'text-light'}`}
              onClick={() => setActiveTab('uploaded')}
            >
              Uploaded Videos
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'liked' ? 'btn-gradient' : 'text-light'}`}
              onClick={() => setActiveTab('liked')}
            >
              Liked Videos
            </button>
          </li>
        </ul>
      </div>

      <div className="row">
        {activeTab === 'uploaded' && (
          <>
            {profile?.uploadedVideos?.length > 0 ? (
              profile.uploadedVideos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <h5 className="text-light">No uploaded videos yet</h5>
                <p className="text-light">Start creating content to see your videos here!</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'liked' && (
          <>
            {profile?.likedVideos?.length > 0 ? (
              profile.likedVideos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <h5 className="text-light">No liked videos yet</h5>
                <p className="text-light">Like videos to see them here!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}