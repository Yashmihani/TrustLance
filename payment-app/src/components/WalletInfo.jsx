import React from 'react'
import { shortenAddress } from '../utils/ethereum'
import { toast } from 'react-toastify'

const WalletInfo = ({ account, balance, onDisconnect, onRefresh, darkMode }) => {
  const copyAddress = () => {
    navigator.clipboard.writeText(account)
    toast.success('Address copied!')
  }

  const card = darkMode
    ? 'bg-gray-900 border-gray-700'
    : 'bg-white border-gray-200 shadow'

  const inner = darkMode ? 'bg-gray-800' : 'bg-gray-100'
  const label = darkMode ? 'text-gray-400' : 'text-gray-500'
  const value = darkMode ? 'text-white' : 'text-gray-900'

  return (
    <div className={'border rounded-2xl p-6 mb-6 ' + card}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm font-medium">Connected</span>
          <span className={label + ' text-xs'}>· Polygon Amoy</span>
        </div>
        <button
          onClick={onDisconnect}
          className={label + ' hover:text-red-400 text-xs transition-colors'}
        >
          Disconnect
        </button>
      </div>

      <div className="text-center my-6">
        <p className={label + ' text-sm mb-1'}>Your balance</p>
        <div className="flex items-center justify-center gap-2">
          <p className={'text-5xl font-bold ' + value}>{balance ?? '0.0000'}</p>
          <span className="text-purple-400 text-xl font-semibold">MATIC</span>
        </div>
        <button
          onClick={onRefresh}
          className={label + ' hover:text-purple-400 transition-colors text-xs mt-2 block mx-auto'}
        >
          Refresh balance
        </button>
      </div>

      <div className={inner + ' rounded-xl p-3 flex items-center justify-between mb-4'}>
        <div>
          <p className={label + ' text-xs mb-0.5'}>Wallet address</p>
          <p className={value + ' font-mono text-sm'}>{shortenAddress(account)}</p>
        </div>
        <button
          onClick={copyAddress}
          className={label + ' hover:text-purple-400 transition-colors p-2 text-sm'}
        >
          Copy
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={inner + ' rounded-xl p-3 text-center'}>
          <p className={label + ' text-xs'}>Network</p>
          <p className={value + ' text-sm font-medium mt-1'}>Polygon Amoy</p>
        </div>
        <div className={inner + ' rounded-xl p-3 text-center'}>
          <p className={label + ' text-xs'}>Status</p>
          <p className="text-green-400 text-sm font-medium mt-1">Active</p>
        </div>
      </div>
    </div>
  )
}

export default WalletInfo