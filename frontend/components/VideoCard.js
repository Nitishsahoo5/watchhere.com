import Link from 'next/link';

export default function VideoCard({ video }) {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <div className="col-md-4 col-lg-3 mb-4">
      <div className="card video-card card-gradient h-100">
        <div className="position-relative">
          <video
            className="card-img-top"
            style={{ height: '200px', objectFit: 'cover' }}
            poster={video.thumbnail}
            preload="metadata"
          >
            <source src={video.url} type="video/mp4" />
          </video>
          {video.duration && (
            <span
              className="position-absolute bottom-0 end-0 bg-dark text-white px-2 py-1 m-2"
              style={{ borderRadius: '5px', fontSize: '0.8rem' }}
            >
              {formatDuration(video.duration)}
            </span>
          )}
        </div>
        
        <div className="card-body text-white">
          <Link href={`/video/${video._id}`} className="text-decoration-none text-white">
            <h6 className="card-title mb-2" style={{ height: '48px', overflow: 'hidden' }}>
              {video.title}
            </h6>
          </Link>
          
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-light">
              {video.uploader?.username || 'Unknown'}
            </small>
            <small className="text-light">
              {formatViews(video.views)} views
            </small>
          </div>
          
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="text-light">
              {video.likes?.length || 0} ❤️
            </small>
            <small className="text-light">
              {new Date(video.createdAt).toLocaleDateString()}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}