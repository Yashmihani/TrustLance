// src/components/layout/Navbar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiZap } from 'react-icons/fi';
import { useWallet } from '../../context/WalletContext';
import { formatAddress } from '../../utils/formatters';
import { APP_NAME } from '../../utils/constants';
import Spinner from '../common/Spinner';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';



const Navbar = () => {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, signIn, isAuthenticating } = useAuth();

  
const navLinks = [
  { path: '/',              label: 'Home' },
  { path: '/explore',       label: 'Find Work' },
  { path: '/post-job',      label: 'Post a Job' },
  { path: '/dashboard',     label: 'Dashboard' },
  { path: '/transactions',  label: 'Transactions' },
];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            {/* Black box with cyan dot */}
            <div className="w-8 h-8 bg-ink-900 rounded-lg flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full" />
            </div>
            <span className="font-bold text-lg text-ink-900">{APP_NAME}</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-ink-900 text-cyan-400'
                    : 'text-gray-500 hover:text-ink-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
         {isConnected && isAuthenticated && (
  <NotificationBell />
)}
          {/* Wallet button */}
          {isConnected ? (
  <div className="flex items-center gap-3">
    {isAuthenticated ? (
      // Show profile when authenticated
      <Link
        to="/dashboard"
        className="flex items-center gap-2 border border-gray-200
                   hover:border-ink-900 px-4 py-2 rounded-xl
                   transition-all duration-200 group"
      >
        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
        <span className="text-sm text-gray-600 font-mono group-hover:text-ink-900">
          {user?.name || formatAddress(account)}
        </span>
      </Link>
    ) : (
      // Show sign button if connected but not authenticated
      <button
        onClick={signIn}
        disabled={isAuthenticating}
        className="btn-primary text-sm py-2 flex items-center gap-2"
      >
        {isAuthenticating
          ? <><Spinner size="sm" color="cyan" /> Signing...</>
          : 'Sign In'
        }
      </button>
    )}
    <button
      onClick={disconnectWallet}
      className="text-sm text-gray-400 hover:text-red-500 transition-colors"
    >
      Disconnect
    </button>
  </div>
) : (
  <button
    onClick={connectWallet}
    disabled={isConnecting}
    className="btn-primary flex items-center gap-2 text-sm py-2.5"
  >
    {isConnecting ? (
      <><Spinner size="sm" color="cyan" /> Connecting...</>
    ) : (
      <><FiZap className="text-cyan-400" /> Connect Wallet</>
    )}
  </button>
)}
          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-500 hover:text-ink-900 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-ink-900 text-cyan-400'
                  : 'text-gray-500 hover:text-ink-900 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            {isConnected ? (
              <div className="flex items-center justify-between px-4 py-3
                              border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  <span className="text-sm text-gray-600 font-mono">
                    {formatAddress(account)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-sm text-red-400"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary w-full text-sm py-2.5"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;