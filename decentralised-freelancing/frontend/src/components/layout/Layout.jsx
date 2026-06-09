// src/components/layout/Layout.jsx
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';
import { FiZap } from 'react-icons/fi';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',   // ink-900
            color: '#f9fafb',
            border: '1px solid #374151',
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#22d3ee', secondary: '#111827' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#111827' },
          },
        }}
      />

      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-ink-900 mt-20">
        <div className="section-container py-12">
          {/* Footer top */}
          <div className="flex flex-col md:flex-row justify-between gap-8 pb-8
                          border-b border-ink-700">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-cyan-400 rounded-lg flex items-center
                                justify-content:center">
                  <FiZap className="text-ink-900 text-sm mx-auto" />
                </div>
                <span className="font-bold text-white">TrustLance</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                Decentralized freelancing platform powered by Polygon smart contracts.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-12">
              <div>
                <p className="text-white font-semibold text-sm mb-3">Platform</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Find Work</li>
                  <li>Post a Job</li>
                  <li>Dashboard</li>
                </ul>
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-3">Network</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Polygon Mumbai</li>
                  <li>Smart Contracts</li>
                  <li>Escrow System</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer bottom */}
          <div className="pt-6 flex flex-col md:flex-row justify-between
                          items-center gap-2">
            <p className="text-gray-500 text-sm">
              © 2026 TrustLance. Built on Polygon.
            </p>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              Mumbai Testnet
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;