import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = Cookies.get('token');
      const [statsRes, videosRes, usersRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/videos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setStats(statsRes.data);
      setVideos(videosRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const deleteVideo = async (videoId) => {
    if (!confirm('Delete this video?')) return;
    
    try {
      const token = Cookies.get('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(videos.filter(v => v._id !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="text-white mb-4">Admin Dashboard</h2>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card card-gradient">
            <div className="card-body text-center">
              <h3 className="text-white">{stats.totalUsers}</h3>
              <p className="text-light">Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-gradient">
            <div className="card-body text-center">
              <h3 className="text-white">{stats.totalVideos}</h3>
              <p className="text-light">Total Videos</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-gradient">
            <div className="card-body text-center">
              <h3 className="text-white">{stats.totalViews}</h3>
              <p className="text-light">Total Views</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-gradient">
            <div className="card-body text-center">
              <h3 className="text-white">{stats.totalComments}</h3>
              <p className="text-light">Total Comments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-gradient mb-4">
        <div className="card-header">
          <h5 className="text-white">Recent Videos</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-dark">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Uploader</th>
                  <th>Views</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map(video => (
                  <tr key={video._id}>
                    <td>{video.title}</td>
                    <td>{video.uploader?.username}</td>
                    <td>{video.views}</td>
                    <td>{new Date(video.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteVideo(video._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}