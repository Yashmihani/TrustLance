import React from 'react'

const BottomNav = ({ activePage, setActivePage, darkMode }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'send', label: 'Send', icon: '💸' },
    { id: 'history', label: 'History', icon: '📋' },
  ]

  const navBg = darkMode
    ? 'bg-gray-900 border-gray-700'
    : 'bg-white border-gray-200 shadow-lg'

  const activeColor = 'text-purple-400'
  const inactiveColor = darkMode ? 'text-gray-500' : 'text-gray-400'

  return (
    <div className={'fixed bottom-0 left-0 right-0 border-t px-4 py-2 z-50 ' + navBg}>
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePage(tab.id)}
            className={
              'flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 ' +
              (activePage === tab.id ? activeColor : inactiveColor)
            }
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
            {activePage === tab.id && (
              <div className="w-1 h-1 rounded-full bg-purple-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default BottomNav