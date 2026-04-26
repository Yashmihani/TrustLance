import React from 'react'
import { FaWallet } from 'react-icons/fa'
import { shortenAddress } from '../utils/ethereum'

const ConnectWallet = ({ account, isConnecting, error, onConnect, onDisconnect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">

      {/* Logo / Title */}
      <div className="mb-10 text-center">
        <div className="text-6xl mb-4">💎</div>
        <h1 className="text-4xl font-bold text-white mb-2">
           <span className="text-purple-400">CryptPay</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Decentralized payments on Polygon
        </p>
      </div>

      {/* Card */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-xl">

        {!account ? (
          <>
            <h2 className="text-xl font-semibold text-white mb-2 text-center">
              Connect your wallet
            </h2>
            <p className="text-gray-400 text-sm text-center mb-8">
              Connect MetaMask to send and receive MATIC on Polygon
            </p>

            {/* Connect Button */}
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
            >
              <FaWallet className="text-xl" />
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 bg-red-900/40 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Connected State */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-sm font-medium">Connected</span>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-xs mb-1">Wallet address</p>
              <p className="text-white font-mono text-sm">{shortenAddress(account)}</p>
            </div>

            <button
              onClick={onDisconnect}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="mt-6 text-gray-600 text-xs">
        Running on Polygon Amoy Testnet
      </p>
    </div>
  )
}

export default ConnectWallet