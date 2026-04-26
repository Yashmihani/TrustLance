import { ethers } from 'ethers'

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined'
}

// Get provider and signer
export const getProviderAndSigner = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed!')
  }
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  return { provider, signer }
}

// Connect wallet — asks MetaMask for permission
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    window.open('https://metamask.io/download/', '_blank')
    throw new Error('Please install MetaMask first!')
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  })

  return accounts[0]
}

// Get MATIC balance
export const getBalance = async (address) => {
  const { provider } = await getProviderAndSigner()
  const balance = await provider.getBalance(address)
  return ethers.formatEther(balance) // converts from wei to MATIC
}

// Shorten address for display: 0x1234...5678
export const shortenAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Add Polygon Amoy Testnet to MetaMask automatically
export const addPolygonAmoyNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x13882',
          chainName: 'Polygon Amoy Testnet',
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
          },
          rpcUrls: ['https://rpc-amoy.polygon.technology/'],
          blockExplorerUrls: ['https://amoy.polygonscan.com/'],
        },
      ],
    })
  } catch (error) {
    console.error('Failed to add network:', error)
  }
}