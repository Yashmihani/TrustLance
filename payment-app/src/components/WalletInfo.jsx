import React from 'react'
import { FaWallet, FaCopy, FaSignOutAlt, FaSync } from 'react-icons/fa'
import { shortenAddress } from '../utils/ethereum'
import { toast } from 'react-toastify'

const WalletInfo = ({ account, balance, onDisconnect, onRefresh }) => {
  const copyAddress = () => {
    navigator.clipboard.writeText(account)
    toast.success('Address copied!')
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm font-medium">Connected</span>
          <span className="text-gray-500 text-xs">· Polygon Amoy</span>
        </div>
        <button
          onClick={onDisconnect}
          className="flex items-center gap-1 text-gray-400 hover:text-red-400 text-xs transition-colors"
        >
          <FaSignOutAlt /> Disconnect
        </button>
      </div>

      {/* Balance */}
      <div className="text-center my-6">
        <p className="text-gray-400 text-sm mb-1">Your balance</p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-5xl font-bold text-white">{balance ?? '0.0000'}</p>
          <span className="text-purple-400 text-xl font-semibold">MATIC</span>
        </div>
        <button
          onClick={onRefresh}
          className="mt-2 text-gray-500 hover:text-purple-400 transition-colors"
          title="Refresh balance"
        >
          <FaSync className="text-xs inline mr-1" />
          <span className="text-xs">Refresh</span>
        </button>
      </div>

      {/* Wallet Address */}
      <div className="bg-gray-800 rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs mb-0.5">Wallet address</p>
          <p className="text-white font-mono text-sm">{shortenAddress(account)}</p>
        </div>
        <button
          onClick={copyAddress}
          className="text-gray-400 hover:text-purple-400 transition-colors p-2"
          title="Copy address"
        >
          <FaCopy />
        </button>
      </div>
    </div>
  )
}

export default WalletInfo