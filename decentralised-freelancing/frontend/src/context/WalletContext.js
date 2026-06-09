// src/context/WalletContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { SUPPORTED_CHAIN_ID, SUPPORTED_CHAIN_NAME } from '../utils/constants';

const WalletContext = createContext(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used inside WalletProvider');
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account,          setAccount]          = useState(null);
  const [provider,         setProvider]         = useState(null);
  const [signer,           setSigner]           = useState(null);
  const [chainId,          setChainId]          = useState(null);
  const [isConnecting,     setIsConnecting]     = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Check if MetaMask is installed
  const checkIfWalletInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  const switchToPolygon = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x13882' }], // 80002 in hex
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId:          '0x13882',
          chainName:        'Polygon Amoy Testnet',
          nativeCurrency:   { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls:          ['https://rpc-amoy.polygon.technology/'],
          blockExplorerUrls: ['https://amoy.polygonscan.com/'],
        }],
      });
    } else {
      throw switchError;
    }
  }
};

  // Disconnect — clears all state
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsCorrectNetwork(false);
    toast.success('Wallet disconnected');
  }, []);

  // Main connect function
  const connectWallet = useCallback(async () => {
    // Prevent double trigger
    if (isConnecting) return;

    if (!checkIfWalletInstalled()) {
      toast.error('MetaMask not found! Install it from metamask.io');
      return;
    }

    setIsConnecting(true);
    try {
      // Request accounts — opens MetaMask popup
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        toast.error('No accounts found');
        return;
      }

      // Build ethers provider and signer
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner   = await ethersProvider.getSigner();
      const network        = await ethersProvider.getNetwork();
      const currentChainId = Number(network.chainId);

      setAccount(accounts[0]);
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setChainId(currentChainId);
      setIsCorrectNetwork(currentChainId === SUPPORTED_CHAIN_ID);

      toast.success('Wallet connected!');

    } catch (error) {
      if (error.code === 4001) {
        toast.error('Connection rejected. Please approve in MetaMask.');
      } else if (error.code === -32002) {
        toast.error('MetaMask is already open — check your browser extension.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
        console.error('Wallet connect error:', error);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  // Switch network manually
  const switchNetwork = useCallback(async () => {
    try {
      await switchToPolygon();
      toast.success('Switched to Polygon Mumbai');
    } catch (error) {
      toast.error('Failed to switch network');
      console.error(error);
    }
  }, []);

  // Listen for MetaMask account or network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        // User locked MetaMask or removed account
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
        setIsCorrectNetwork(false);
        toast('Wallet disconnected', { icon: '🔌' });
      } else if (accounts[0]?.toLowerCase() !== account?.toLowerCase()) {
        // Only update if account actually changed
        setAccount(accounts[0]);
        toast('Account switched', { icon: '🔄' });
      }
    };

    const handleChainChanged = (chainIdHex) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      setIsCorrectNetwork(newChainId === SUPPORTED_CHAIN_ID);
      if (newChainId !== SUPPORTED_CHAIN_ID) {
        toast.error(`Wrong network — switch to ${SUPPORTED_CHAIN_NAME}`);
      } else {
        toast.success('Connected to Polygon Mumbai');
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged',    handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged',    handleChainChanged);
    };
  }, [account]);

  // Auto-restore session silently on page load
  useEffect(() => {
    const autoRestore = async () => {
      if (!window.ethereum) return;

      try {
        // eth_accounts does NOT open MetaMask popup
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (!accounts || accounts.length === 0) return;

        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        const network        = await ethersProvider.getNetwork();
        const currentChainId = Number(network.chainId);

        // Try to get signer silently
        let ethersSigner = null;
        try {
          ethersSigner = await ethersProvider.getSigner();
        } catch (e) {
          // Signer not available — user needs to reconnect
          return;
        }

        setAccount(accounts[0]);
        setProvider(ethersProvider);
        setSigner(ethersSigner);
        setChainId(currentChainId);
        setIsCorrectNetwork(currentChainId === SUPPORTED_CHAIN_ID);

        // No toast — silent restore

      } catch (error) {
        // Silent fail — user connects manually
        console.log('Auto-restore skipped:', error.message);
      }
    };

    // Small delay to let MetaMask initialize properly
    const timer = setTimeout(autoRestore, 800);
    return () => clearTimeout(timer);
  }, []);

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isConnected: !!account,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};