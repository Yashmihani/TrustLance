import React, { useState } from 'react'
import { ethers } from 'ethers'
import { sendPaymentContract } from '../utils/contract'
import { toast } from 'react-toastify'

const SendMatic = ({ onTransactionSent, darkMode }) => {
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

  const card = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow'
  const inner = darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'
  const label = darkMode ? 'text-gray-400' : 'text-gray-500'
  const input = darkMode ? 'text-white' : 'text-gray-900'

  return (
    <div className={'border rounded-2xl p-6 mb-6 ' + card}>
      <h2 className={'text-lg font-semibold mb-4 ' + input}>Send MATIC</h2>

      <div className="mb-4">
        <label className={label + ' text-xs mb-1 block'}>Recipient address</label>
        <input
          type="text"
          placeholder="0x..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className={'w-full border rounded-xl px-4 py-3 text-sm outline-none font-mono ' + inner + ' ' + input}
        />
      </div>

      <div className="mb-4">
        <label className={label + ' text-xs mb-1 block'}>Amount (MATIC)</label>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={'w-full border rounded-xl px-4 py-3 text-sm outline-none ' + inner + ' ' + input}
        />
      </div>

      <div className="mb-6">
        <label className={label + ' text-xs mb-1 block'}>Message (optional)</label>
        <input
          type="text"
          placeholder="Payment for..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={'w-full border rounded-xl px-4 py-3 text-sm outline-none ' + inner + ' ' + input}
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
        <div className={'mt-4 p-3 rounded-xl ' + (darkMode ? 'bg-gray-800' : 'bg-gray-100')}>
          <p className={label + ' text-xs mb-1'}>Transaction hash</p>
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