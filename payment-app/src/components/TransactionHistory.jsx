import React from 'react'
import { shortenAddress } from '../utils/ethereum'

const TransactionHistory = ({ transactions, darkMode }) => {
  const card = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow'
  const inner = darkMode ? 'bg-gray-800' : 'bg-gray-100'
  const label = darkMode ? 'text-gray-400' : 'text-gray-500'
  const value = darkMode ? 'text-white' : 'text-gray-900'

  if (transactions.length === 0) {
    return (
      <div className={'border rounded-2xl p-6 ' + card}>
        <h2 className={'text-lg font-semibold mb-4 ' + value}>Transaction History</h2>
        <p className={label + ' text-sm text-center py-8'}>No transactions yet</p>
      </div>
    )
  }

  return (
    <div className={'border rounded-2xl p-6 ' + card}>
      <h2 className={'text-lg font-semibold mb-4 ' + value}>Transaction History</h2>
      <div className="space-y-3">
        {transactions.map((tx, index) => (
          <div key={index} className={inner + ' rounded-xl p-4'}>
            <div className="flex justify-between items-center">
              <div>
                <p className={value + ' text-sm'}>To: {shortenAddress(tx.recipient)}</p>
                <p className={label + ' text-xs italic mt-0.5'}>"{tx.message}"</p>
                <p className={label + ' text-xs mt-0.5'}>
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-purple-400 font-semibold">-{tx.amount} MATIC</p>
                <a
                  href={'https://amoy.polygonscan.com/tx/' + tx.hash}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={label + ' text-xs hover:text-purple-400 mt-0.5 block'}
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