import React from 'react'

const Skeleton = ({ darkMode, width, height, rounded }) => {
  const base = darkMode ? 'bg-gray-700' : 'bg-gray-300'
  const r = rounded ? 'rounded-full' : 'rounded-lg'
  return (
    <div
      className={base + ' ' + r + ' animate-pulse'}
      style={{ width: width || '100%', height: height || '16px' }}
    />
  )
}

export const WalletSkeleton = ({ darkMode }) => {
  const card = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow'
  const inner = darkMode ? 'bg-gray-800' : 'bg-gray-100'

  return (
    <div className={'border rounded-2xl p-6 mb-6 ' + card}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton darkMode={darkMode} width="120px" height="12px" />
        <Skeleton darkMode={darkMode} width="80px" height="12px" />
      </div>

      <div className="text-center my-6">
        <Skeleton darkMode={darkMode} width="80px" height="12px" />
        <div className="flex items-center justify-center gap-2 mt-3">
          <Skeleton darkMode={darkMode} width="160px" height="48px" rounded />
        </div>
        <div className="mt-3 flex justify-center">
          <Skeleton darkMode={darkMode} width="100px" height="12px" />
        </div>
      </div>

      <div className={inner + ' rounded-xl p-3 mb-4'}>
        <Skeleton darkMode={darkMode} width="100px" height="10px" />
        <div className="mt-2">
          <Skeleton darkMode={darkMode} width="180px" height="14px" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={inner + ' rounded-xl p-3'}>
          <Skeleton darkMode={darkMode} width="60px" height="10px" />
          <div className="mt-2">
            <Skeleton darkMode={darkMode} width="100px" height="14px" />
          </div>
        </div>
        <div className={inner + ' rounded-xl p-3'}>
          <Skeleton darkMode={darkMode} width="60px" height="10px" />
          <div className="mt-2">
            <Skeleton darkMode={darkMode} width="80px" height="14px" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skeleton