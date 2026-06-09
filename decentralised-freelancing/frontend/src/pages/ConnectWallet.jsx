// frontend/src/pages/ConnectWallet.jsx
// Shown when user tries to access a protected page without connecting

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiZap, FiShield, FiCheckCircle } from 'react-icons/fi';
import { useWallet } from '../context/WalletContext';
import { useAuth }   from '../context/AuthContext';
import Spinner       from '../components/common/Spinner';

const ConnectWallet = () => {
  const navigate = useNavigate();
  const { isConnected, isConnecting, connectWallet } = useWallet();
  const { isAuthenticated, isAuthenticating, signIn } = useAuth();

  // Redirect to dashboard once authenticated
  useEffect(() => {
    if (isConnected && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isConnected, isAuthenticated, navigate]);

  const steps = [
    {
      icon: <FiZap />,
      title: 'Connect Wallet',
      desc:  'Click the button below to connect MetaMask',
      done:  isConnected,
    },
    {
      icon: <FiShield />,
      title: 'Sign Message',
      desc:  'Sign a message to prove wallet ownership',
      done:  isAuthenticated,
    },
    {
      icon: <FiCheckCircle />,
      title: 'Access Platform',
      desc:  'Start posting or finding work',
      done:  false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-ink-900 rounded-2xl flex items-center
                          justify-center mx-auto mb-4">
            <div className="w-5 h-5 bg-cyan-400 rounded-full" />
          </div>
          <h1 className="text-3xl font-extrabold text-ink-900 mb-2">
            Welcome to TrustLance
          </h1>
          <p className="text-gray-500">
            Connect your wallet to get started — no email or password needed.
          </p>
        </div>

        {/* Steps */}
        <div className="card mb-6">
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                flex-shrink-0 transition-all ${
                  step.done
                    ? 'bg-cyan-400 text-ink-900'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.icon}
                </div>
                {/* Text */}
                <div className="flex-1 pt-1">
                  <p className={`font-semibold text-sm ${
                    step.done ? 'text-ink-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                    {step.done && (
                      <span className="ml-2 text-xs text-cyan-600
                                       bg-cyan-50 px-2 py-0.5 rounded-full">
                        Done
                      </span>
                    )}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          {!isConnected ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <><Spinner size="sm" color="cyan" /> Connecting...</>
              ) : (
                <><FiZap /> Connect MetaMask</>
              )}
            </button>
          ) : !isAuthenticated ? (
            <button
              onClick={signIn}
              disabled={isAuthenticating}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isAuthenticating ? (
                <><Spinner size="sm" color="cyan" /> Signing...</>
              ) : (
                <><FiShield /> Sign Message</>
              )}
            </button>
          ) : (
            <div className="text-center text-green-600 font-semibold">
              ✅ Authenticated! Redirecting...
            </div>
          )}

          <p className="text-center text-xs text-gray-400">
            Don't have MetaMask?{' '}
            
              href="https://metamask.io"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-600 hover:underline"
            
              Install it here
          </p>
        </div>

      </div>
    </div>
  );
};

export default ConnectWallet;