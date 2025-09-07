import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTrending, useVideos } from '../hooks/useVideos';
import VideoCard from '../components/VideoCard';

export default function HomePage() {
  const [category, setCategory] = useState('all');
  const router = useRouter();
  const { search } = router.query;

  const categories = ['all', 'Entertainment', 'Education', 'Music', 'Gaming', 'Sports', 'News'];

  const params = {};
  if (search) params.search = search;
  if (category !== 'all') params.category = category;

  const { videos, loading, error } = search || category !== 'all' 
    ? useVideos(params)
    : useTrending();

  return (
    <div className="container py-4">
      {search && (
        <div className="mb-4">
          <h4 className="text-white">Search results for: "{search}"</h4>
        </div>
      )}

      <div className="mb-4">
        <div className="d-flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn ${category === cat ? 'btn-gradient' : 'btn-outline-light'}`}
              onClick={() => setCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="col-12 text-center py-5">
          <h5 className="text-danger">Error loading videos</h5>
          <p className="text-light">{error}</p>
        </div>
      ) : (
        <div className="row">
          {videos.length > 0 ? (
            videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <h5 className="text-light">No videos found</h5>
              <p className="text-light">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}