import React, { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useWallet from './hooks/useWallet'
import ConnectWallet from './components/ConnectWallet'
import WalletInfo from './components/WalletInfo'
import SendMatic from './components/SendMatic'
import TransactionHistory from './components/TransactionHistory'

function App() {
  const {
    account,
    balance,
    isConnecting,
    error,
    connect,
    disconnect,
    fetchBalance,
  } = useWallet()

  const [transactions, setTransactions] = useState([])

  const handleTransactionSent = (hash, recipient, amount, message) => {
  const newTx = {
    hash,
    recipient,
    amount,
    message: message || 'Payment',
    timestamp: Date.now(),
  }
  setTransactions((prev) => [newTx, ...prev])
  fetchBalance(account)
}

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <ToastContainer theme="dark" position="top-right" />

      {!account ? (
        <ConnectWallet
          account={account}
          isConnecting={isConnecting}
          error={error}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      ) : (
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-3xl">💎</span>
            <h1 className="text-2xl font-bold text-white mt-1">
               <span className="text-purple-400">CryptPay</span>
            </h1>
          </div>

          {/* Wallet Info */}
          <WalletInfo
            account={account}
            balance={balance}
            onDisconnect={disconnect}
            onRefresh={() => fetchBalance(account)}
          />

          {/* Send MATIC */}
          <SendMatic onTransactionSent={handleTransactionSent} />

          {/* Transaction History */}
          <TransactionHistory transactions={transactions} />
        </div>
      )}
    </div>
  )
}

export default App