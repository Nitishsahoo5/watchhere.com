import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import '../styles/globals.css';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-vh-100">
          <Navbar />
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}