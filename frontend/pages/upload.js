import { useState } from 'react';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function UploadPage({ user }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('General');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const categories = ['General', 'Entertainment', 'Education', 'Music', 'Gaming', 'Sports', 'News'];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim() || !user) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    formData.append('category', category);

    try {
      const token = Cookies.get('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        }
      );

      router.push('/profile');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-white">Please login to upload videos</h4>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card card-gradient">
            <div className="card-body">
              <h3 className="text-white mb-4">Upload Video</h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded p-5 text-center cursor-pointer ${
                      isDragActive ? 'border-primary' : 'border-light'
                    }`}
                    style={{ minHeight: '200px' }}
                  >
                    <input {...getInputProps()} />
                    {file ? (
                      <div>
                        <h5 className="text-white">📹 {file.name}</h5>
                        <p className="text-light">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                          type="button"
                          className="btn btn-outline-light btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h5 className="text-white">
                          {isDragActive ? 'Drop video here...' : 'Drag & drop video or click to browse'}
                        </h5>
                        <p className="text-light">Supports MP4, MOV, AVI, MKV</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-white">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-white">Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Tags (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="gaming, tutorial, fun"
                    />
                  </div>
                </div>

                {uploading && (
                  <div className="mb-3">
                    <div className="progress">
                      <div
                        className="progress-bar bg-gradient"
                        style={{ width: `${progress}%` }}
                      >
                        {progress}%
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-gradient w-100"
                  disabled={!file || !title.trim() || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}