import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import '../styles/globals.css';
import Cookies from 'js-cookie';
import axios from 'axios';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      // Decode token to get user info (simplified)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id });
      } catch (error) {
        Cookies.remove('token');
      }
    }
    setLoading(false);

    // Load Bootstrap JS
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-vh-100">
        <Navbar user={user} setUser={setUser} />
        <Component {...pageProps} user={user} setUser={setUser} />
      </div>
    </QueryClientProvider>
  );
}