// frontend/src/components/common/ProtectedRoute.jsx
// Wraps pages that require authentication
// Redirects to home if not connected

import { Navigate } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import { useAuth }   from '../../context/AuthContext';
import Spinner       from './Spinner';

const ProtectedRoute = ({ children }) => {
  const { isConnected, isConnecting } = useWallet();
  const { isAuthenticated, isAuthenticating } = useAuth();

  // Show spinner while connecting or authenticating
  if (isConnecting || isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="dark" />
          <p className="mt-4 text-gray-500 text-sm">
            {isConnecting ? 'Connecting wallet...' : 'Authenticating...'}
          </p>
        </div>
      </div>
    );
  }

  // Redirect to home if not connected or authenticated
  if (!isConnected || !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;