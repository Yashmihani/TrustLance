import { useState, useEffect, useCallback } from 'react'
import {
  connectWallet,
  getBalance,
  addPolygonAmoyNetwork,
  isMetaMaskInstalled,
} from '../utils/ethereum'

const useWallet = () => {
  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [chainId, setChainId] = useState(null)

  // Fetch balance whenever account changes
  const fetchBalance = useCallback(async (address) => {
    try {
      const bal = await getBalance(address)
      setBalance(parseFloat(bal).toFixed(4))
    } catch (err) {
      console.error('Balance fetch failed:', err)
    }
  }, [])

  // Connect wallet handler
  const connect = async () => {
    setIsConnecting(true)
    setError(null)
    try {
      await addPolygonAmoyNetwork()
      const address = await connectWallet()
      setAccount(address)
      await fetchBalance(address)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    setAccount(null)
    setBalance(null)
    setError(null)
  }

  // Listen for account or network changes in MetaMask
  useEffect(() => {
    if (!isMetaMaskInstalled()) return

    const handleAccountChange = (accounts) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setAccount(accounts[0])
        fetchBalance(accounts[0])
      }
    }

    const handleChainChange = (newChainId) => {
      setChainId(newChainId)
      window.location.reload() // safest way to handle network switch
    }

    window.ethereum.on('accountsChanged', handleAccountChange)
    window.ethereum.on('chainChanged', handleChainChange)

    // Cleanup listeners when component unmounts
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountChange)
      window.ethereum.removeListener('chainChanged', handleChainChange)
    }
  }, [fetchBalance])

  return {
    account,
    balance,
    isConnecting,
    error,
    chainId,
    connect,
    disconnect,
    fetchBalance,
  }
}

export default useWallet