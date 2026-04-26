import React, { useState } from 'react'
import { ethers } from 'ethers'
import { sendPaymentContract } from '../utils/contract'
import { toast } from 'react-toastify'

const SendMatic = ({ onTransactionSent }) => {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [txHash, setTxHash] = useState(null)

  const sendMatic = async () => {
    if (!recipient || !amount) {
      toast.error('Please fill in all fields')
      return
    }
    if (!ethers.isAddress(recipient)) {
      toast.error('Invalid wallet address')
      return
    }
    const amountNum = parseFloat(amount)
    if (amountNum <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }
    setIsSending(true)
    setTxHash(null)
    try {
      const tx = await sendPaymentContract(recipient, amount, message || 'Payment')
      toast.info('Transaction sent! Waiting...')
      setTxHash(tx.hash)
      toast.success('Payment confirmed on blockchain!')
      onTransactionSent(tx.hash, recipient, amount, message)
      setRecipient('')
      setAmount('')
      setMessage('')
    } catch (err) {
      if (err.code === 4001) {
        toast.error('Rejected by user')
      } else {
        toast.error('Transaction failed')
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Send MATIC</h2>
      <div className="mb-4">
        <label className="text-gray-400 text-xs mb-1 block">Recipient address</label>
        <input
          type="text"
          placeholder="0x..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm outline-none font-mono"
        />
      </div>
      <div className="mb-4">
        <label className="text-gray-400 text-xs mb-1 block">Amount (MATIC)</label>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm outline-none"
        />
      </div>
      <div className="mb-6">
        <label className="text-gray-400 text-xs mb-1 block">Message (optional)</label>
        <input
          type="text"
          placeholder="Payment for..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm outline-none"
        />
      </div>
      <button
        onClick={sendMatic}
        disabled={isSending}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white font-semibold py-4 rounded-xl transition-all"
      >
        {isSending ? 'Sending...' : 'Send MATIC'}
      </button>
      {txHash && (
        <div className="mt-4 p-3 bg-gray-800 rounded-xl">
          <p className="text-gray-400 text-xs mb-1">Transaction hash</p>
          <a
            href={'https://amoy.polygonscan.com/tx/' + txHash}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 text-xs font-mono hover:underline break-all"
          >
            {txHash}
          </a>
        </div>
      )}
    </div>
  )
}

export default SendMatic