import React from 'react'
import { shortenAddress } from '../utils/ethereum'

const TransactionHistory = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Transaction History</h2>
        <p className="text-gray-500 text-sm text-center py-8">No transactions yet</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Transaction History</h2>
      <div className="space-y-3">
        {transactions.map((tx, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white text-sm">To: {shortenAddress(tx.recipient)}</p>
                <p className="text-gray-400 text-xs mt-0.5 italic">"{tx.message}"</p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-purple-400 font-semibold">-{tx.amount} MATIC</p>
                <a
                  href={'https://amoy.polygonscan.com/tx/' + tx.hash}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 text-xs hover:text-purple-400"
                >
                  View tx
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TransactionHistory