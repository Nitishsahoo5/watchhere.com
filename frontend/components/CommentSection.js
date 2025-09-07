import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function CommentSection({ videoId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/comments/${videoId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/comments/${videoId}`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h5 className="text-white mb-3">Comments ({comments.length})</h5>
      
      {user && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ borderRadius: '25px 0 0 25px' }}
            />
            <button
              type="submit"
              className="btn btn-gradient"
              disabled={loading || !newComment.trim()}
              style={{ borderRadius: '0 25px 25px 0' }}
            >
              {loading ? '...' : 'Post'}
            </button>
          </div>
        </form>
      )}

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment._id} className="card card-gradient mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-white mb-1">{comment.user.username}</h6>
                  <p className="text-light mb-0">{comment.text}</p>
                </div>
                <small className="text-light">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        ))}
        
        {comments.length === 0 && (
          <p className="text-light text-center">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}