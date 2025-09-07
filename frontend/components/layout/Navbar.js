import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function Navbar({ user, setUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
      <div className="container">
        <Link href="/" className="navbar-brand fw-bold fs-3">
          🎬 WatchHere
        </Link>

        <form className="d-flex mx-auto" style={{ width: '400px' }} onSubmit={handleSearch}>
          <input
            className="form-control me-2"
            type="search"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ borderRadius: '25px' }}
          />
          <button className="btn btn-gradient" type="submit">
            🔍
          </button>
        </form>

        <div className="navbar-nav ms-auto">
          {user ? (
            <div className="dropdown">
              <button
                className="btn btn-gradient dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                {user.username}
              </button>
              <ul className="dropdown-menu">
                <li>
                  <Link href="/upload" className="dropdown-item">
                    Upload Video
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="dropdown-item">
                    My Profile
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div>
              <Link href="/login" className="btn btn-outline-light me-2">
                Login
              </Link>
              <Link href="/register" className="btn btn-gradient">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}