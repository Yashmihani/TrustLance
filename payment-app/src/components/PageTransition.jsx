import React, { useEffect, useState } from 'react'

const PageTransition = ({ children, page }) => {
  const [displayPage, setDisplayPage] = useState(page)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (page !== displayPage) {
      setVisible(false)
      const timer = setTimeout(() => {
        setDisplayPage(page)
        setVisible(true)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [page, displayPage])

  return (
    <div
      style={{
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(10px)',
      }}
    >
      {children}
    </div>
  )
}

export default PageTransition