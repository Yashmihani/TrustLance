import { ethers } from 'ethers'
import { getProviderAndSigner } from './ethereum'

// Your deployed contract address
export const CONTRACT_ADDRESS = '0x7AEc869BaA16931a027B988251c853a2f7D1e01f'

// Contract ABI — tells ethers.js how to talk to your contract
export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address payable', name: 'recipient', type: 'address' },
      { internalType: 'string', name: 'message', type: 'string' },
    ],
    name: 'sendPayment',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
      { indexed: true, internalType: 'address', name: 'recipient', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'message', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'PaymentSent',
    type: 'event',
  },
]

// Get contract instance
export const getContract = async () => {
  const { signer } = await getProviderAndSigner()
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
}

// Send payment through contract
export const sendPaymentContract = async (recipient, amount, message) => {
  const contract = await getContract()
  const tx = await contract.sendPayment(recipient, message, {
    value: ethers.parseEther(amount),
  })
  await tx.wait(1)
  return tx
}

// Get past payment events for an address
export const getPaymentHistory = async (address) => {
  const { provider } = await getProviderAndSigner()
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

  const filter = contract.filters.PaymentSent(address, null)
  const events = await contract.queryFilter(filter, -10000)

  return events.map((e) => ({
    hash: e.transactionHash,
    recipient: e.args.recipient,
    amount: ethers.formatEther(e.args.amount),
    message: e.args.message,
    timestamp: Number(e.args.timestamp) * 1000,
  }))
}