// frontend/src/hooks/useContract.js
// All smart contract interactions + transaction logging

import { useState, useCallback } from 'react';
import { ethers }                from 'ethers';
import { useWallet }             from '../context/WalletContext';
import transactionService        from '../services/transactionService';
import toast                     from 'react-hot-toast';

// EscrowFactory ABI
const ESCROW_FACTORY_ABI = [
  "function createEscrow(address _freelancer, string memory _projectId, uint256 _deadline) external returns (address)",
  "function getProjectEscrow(string memory _projectId) external view returns (address)",
  "function getUserEscrows(address _user) external view returns (address[])",
  "event EscrowCreated(address indexed escrowAddress, address indexed client, address indexed freelancer, string projectId, uint256 timestamp)",
];

// Escrow ABI
const ESCROW_ABI = [
  "function deposit() external payable",
  "function releasePayment() external",
  "function refundClient() external",
  "function disputeProject() external",
  "function resolveDispute(address _winner) external",
  "function getDetails() external view returns (address, address, uint256, uint8, string, uint256, uint256)",
  "function getBalance() external view returns (uint256)",
  "function client() external view returns (address)",
  "function freelancer() external view returns (address)",
  "function amount() external view returns (uint256)",
  "function status() external view returns (uint8)",
  "function platformFee() external view returns (uint256)",
  "event PaymentDeposited(address indexed client, uint256 amount, uint256 timestamp)",
  "event PaymentReleased(address indexed freelancer, uint256 amount, uint256 platformFeeAmount, uint256 timestamp)",
  "event PaymentRefunded(address indexed client, uint256 amount, uint256 timestamp)",
  "event DisputeRaised(address indexed raisedBy, uint256 timestamp)",
];

// Human-readable escrow status
export const ESCROW_STATUS = {
  0: { label: 'Awaiting Payment', color: 'bg-yellow-100 text-yellow-800' },
  1: { label: 'Funded',           color: 'bg-blue-100 text-blue-800'    },
  2: { label: 'Complete',         color: 'bg-green-100 text-green-800'  },
  3: { label: 'Refunded',         color: 'bg-gray-100 text-gray-800'    },
  4: { label: 'Disputed',         color: 'bg-red-100 text-red-800'      },
};

const useContract = () => {
  const { signer, provider, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const factoryAddress = process.env.REACT_APP_ESCROW_FACTORY_ADDRESS;

  // Get factory contract instance
  const getFactory = useCallback(() => {
    if (!signer) throw new Error('Wallet not connected');
    if (!factoryAddress) throw new Error('Factory address not configured');
    return new ethers.Contract(factoryAddress, ESCROW_FACTORY_ABI, signer);
  }, [signer, factoryAddress]);

  // Get escrow contract instance
  const getEscrow = useCallback((escrowAddress) => {
    if (!signer) throw new Error('Wallet not connected');
    return new ethers.Contract(escrowAddress, ESCROW_ABI, signer);
  }, [signer]);

  // ── CREATE ESCROW ──────────────────────────────────────────────
  const createEscrow = useCallback(async (
    freelancerAddress,
    projectId,
    deadlineDate
  ) => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    try {
      const factory  = getFactory();
      const deadline = deadlineDate
        ? Math.floor(new Date(deadlineDate).getTime() / 1000)
        : Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days default

      toast.loading('Creating escrow contract...', { id: 'escrow-create' });

      const tx      = await factory.createEscrow(
        freelancerAddress,
        projectId,
        deadline
      );
      const receipt = await tx.wait();

      // Get escrow address from event
      let escrowAddress = null;
      for (const log of receipt.logs) {
        try {
          const parsed = factory.interface.parseLog(log);
          if (parsed?.name === 'EscrowCreated') {
            escrowAddress = parsed.args[0];
            break;
          }
        } catch {}
      }

      toast.success('Escrow contract created!', { id: 'escrow-create' });

      return {
        escrowAddress,
        txHash: receipt.hash,
      };

    } catch (error) {
      const msg = error.reason || error.message || 'Failed to create escrow';
      toast.error(msg, { id: 'escrow-create' });
      console.error('createEscrow error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, getFactory]);

  // ── DEPOSIT ───────────────────────────────────────────────────
  const depositToEscrow = useCallback(async (
    escrowAddress,
    amountInMatic,
    projectId
  ) => {
    setIsLoading(true);
    try {
      const escrow = getEscrow(escrowAddress);
      const value  = ethers.parseEther(amountInMatic.toString());

      toast.loading('Depositing MATIC to escrow...', { id: 'deposit' });

      const tx      = await escrow.deposit({ value });
      const receipt = await tx.wait();

      // Log to backend
      await transactionService.log({
        projectId,
        from:        account,
        to:          escrowAddress,
        amount:      parseFloat(amountInMatic),
        type:        'deposit',
        txHash:      receipt.hash,
        blockNumber: receipt.blockNumber,
      });

      toast.success('Payment locked in escrow!', { id: 'deposit' });
      return receipt.hash;

    } catch (error) {
      const msg = error.reason || error.message || 'Deposit failed';
      toast.error(msg, { id: 'deposit' });
      console.error('deposit error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getEscrow, account]);

  // ── RELEASE PAYMENT ───────────────────────────────────────────
  const releasePayment = useCallback(async (
    escrowAddress,
    freelancerAddress,
    projectId
  ) => {
    setIsLoading(true);
    try {
      const escrow = getEscrow(escrowAddress);

      toast.loading('Releasing payment to freelancer...', { id: 'release' });

      const tx      = await escrow.releasePayment();
      const receipt = await tx.wait();

      // Get released amount from event
      let releasedAmount = 0;
      for (const log of receipt.logs) {
        try {
          const parsed = escrow.interface.parseLog(log);
          if (parsed?.name === 'PaymentReleased') {
            releasedAmount = parseFloat(
              ethers.formatEther(parsed.args[1])
            );
            break;
          }
        } catch {}
      }

      // Log to backend
      await transactionService.log({
        projectId,
        from:        escrowAddress,
        to:          freelancerAddress,
        amount:      releasedAmount,
        type:        'release',
        txHash:      receipt.hash,
        blockNumber: receipt.blockNumber,
      });

      toast.success('Payment released to freelancer! 🎉', { id: 'release' });
      return receipt.hash;

    } catch (error) {
      const msg = error.reason || error.message || 'Release failed';
      toast.error(msg, { id: 'release' });
      console.error('release error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getEscrow, account]);

  // ── REFUND CLIENT ─────────────────────────────────────────────
  const refundClient = useCallback(async (
    escrowAddress,
    projectId,
    amount
  ) => {
    setIsLoading(true);
    try {
      const escrow = getEscrow(escrowAddress);

      toast.loading('Processing refund...', { id: 'refund' });

      const tx      = await escrow.refundClient();
      const receipt = await tx.wait();

      // Log to backend
      await transactionService.log({
        projectId,
        from:        escrowAddress,
        to:          account,
        amount:      parseFloat(amount),
        type:        'refund',
        txHash:      receipt.hash,
        blockNumber: receipt.blockNumber,
      });

      toast.success('Refund processed successfully!', { id: 'refund' });
      return receipt.hash;

    } catch (error) {
      const msg = error.reason || error.message || 'Refund failed';
      toast.error(msg, { id: 'refund' });
      console.error('refund error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getEscrow, account]);

  // ── DISPUTE ───────────────────────────────────────────────────
  const raiseDispute = useCallback(async (escrowAddress, projectId) => {
    setIsLoading(true);
    try {
      const escrow = getEscrow(escrowAddress);

      toast.loading('Raising dispute...', { id: 'dispute' });

      const tx      = await escrow.disputeProject();
      const receipt = await tx.wait();

      // Log to backend
      await transactionService.log({
        projectId,
        from:        account,
        to:          escrowAddress,
        amount:      0,
        type:        'dispute',
        txHash:      receipt.hash,
        blockNumber: receipt.blockNumber,
      });

      toast.success('Dispute raised. Platform will review.', { id: 'dispute' });
      return receipt.hash;

    } catch (error) {
      const msg = error.reason || error.message || 'Dispute failed';
      toast.error(msg, { id: 'dispute' });
      console.error('dispute error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getEscrow, account]);

  // ── GET ESCROW DETAILS ────────────────────────────────────────
  const getEscrowDetails = useCallback(async (escrowAddress) => {
    if (!escrowAddress || !provider) return null;
    try {
      const escrow   = new ethers.Contract(escrowAddress, ESCROW_ABI, provider);
      const details  = await escrow.getDetails();
      const fee      = await escrow.platformFee();

      return {
        client:      details[0],
        freelancer:  details[1],
        amount:      ethers.formatEther(details[2]),
        status:      Number(details[3]),
        projectId:   details[4],
        createdAt:   new Date(Number(details[5]) * 1000),
        deadline:    new Date(Number(details[6]) * 1000),
        platformFee: Number(fee),
      };
    } catch (error) {
      console.error('getEscrowDetails error:', error);
      return null;
    }
  }, [provider]);

  // ── GET ESCROW BY PROJECT ID ──────────────────────────────────
  const getProjectEscrowAddress = useCallback(async (projectId) => {
    if (!provider || !factoryAddress) return null;
    try {
      const factory = new ethers.Contract(
        factoryAddress,
        ESCROW_FACTORY_ABI,
        provider
      );
      const address = await factory.getProjectEscrow(projectId);
      // Returns zero address if no escrow exists
      if (address === ethers.ZeroAddress) return null;
      return address;
    } catch (error) {
      console.error('getProjectEscrowAddress error:', error);
      return null;
    }
  }, [provider, factoryAddress]);

  return {
    isLoading,
    createEscrow,
    depositToEscrow,
    releasePayment,
    refundClient,
    raiseDispute,
    getEscrowDetails,
    getProjectEscrowAddress,
    ESCROW_STATUS,
  };
};

export default useContract;