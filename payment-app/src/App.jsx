import React, { useState, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useWallet from './hooks/useWallet'
import ConnectWallet from './components/ConnectWallet'
import WalletInfo from './components/WalletInfo'
import SendMatic from './components/SendMatic'
import TransactionHistory from './components/TransactionHistory'
import BottomNav from './components/BottomNav'
import { WalletSkeleton } from './components/Skeleton'
import PageTransition from './components/PageTransition'

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
  const [activePage, setActivePage] = useState('home')
  const [darkMode, setDarkMode] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.body.style.backgroundColor = '#030712'
    } else {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = '#f3f4f6'
    }
  }, [darkMode])

  useEffect(() => {
    if (account) {
      setIsLoading(true)
      setTimeout(() => setIsLoading(false), 1500)
    }
  }, [account])

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
    setActivePage('history')
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await fetchBalance(account)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const renderPage = () => {
    if (activePage === 'home') {
      if (isLoading) {
        return <WalletSkeleton darkMode={darkMode} />
      }
      return (
        <WalletInfo
          account={account}
          balance={balance}
          onDisconnect={disconnect}
          onRefresh={handleRefresh}
          darkMode={darkMode}
        />
      )
    }
    if (activePage === 'send') {
      return (
        <SendMatic onTransactionSent={handleTransactionSent} darkMode={darkMode} />
      )
    }
    if (activePage === 'history') {
      return (
        <TransactionHistory transactions={transactions} darkMode={darkMode} />
      )
    }
  }

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-100'
  const text = darkMode ? 'text-white' : 'text-gray-900'

  return (
    <div className={'min-h-screen ' + bg + ' ' + text}>
      <ToastContainer theme={darkMode ? 'dark' : 'light'} position="top-right" />

      {!account ? (
        <ConnectWallet
          account={account}
          isConnecting={isConnecting}
          error={error}
          onConnect={connect}
          onDisconnect={disconnect}
          darkMode={darkMode}
          toggleDark={() => setDarkMode(!darkMode)}
        />
      ) : (
        <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-purple-400">CryptPay</span>
              </h1>
              <p className={darkMode ? 'text-gray-500 text-xs mt-1' : 'text-gray-400 text-xs mt-1'}>
                Polygon Amoy Testnet
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={
                'w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ' +
                (darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200 shadow')
              }
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>

          <PageTransition page={activePage}>
            {renderPage()}
          </PageTransition>

          <BottomNav
            activePage={activePage}
            setActivePage={setActivePage}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  )
}

export default App