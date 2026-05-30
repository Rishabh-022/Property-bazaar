import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const { notifications } = useSocket()
  const { darkMode, toggleTheme } = useTheme()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-xl">PB</span>
            </motion.div>
            <span className={`text-2xl font-bold font-display ${scrolled ? 'text-blue-950 dark:text-blue-200' : 'text-blue-900 dark:text-blue-100'}`}>
              Property<span className="text-yellow-500">Bazzar</span>
            </span>
          </Link>

          {}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`font-medium transition-colors ${scrolled ? 'text-gray-700 dark:text-gray-200 hover:text-blue-600' : 'text-blue-900 dark:text-blue-100 hover:text-blue-700'}`}>
              {t('nav.home')}
            </Link>

            {user ? (
              <>
                <Link to="/properties" className={`font-medium transition-colors ${scrolled ? 'text-gray-700 dark:text-gray-200 hover:text-blue-600' : 'text-blue-900 dark:text-blue-100 hover:text-blue-700'}`}>
                  {t('nav.buy')}
                </Link>
                <Link to="/sell" className={`font-medium transition-colors ${scrolled ? 'text-gray-700 dark:text-gray-200 hover:text-blue-600' : 'text-blue-900 dark:text-blue-100 hover:text-blue-700'}`}>
                  {t('nav.sell')}
                </Link>

                {}
                <Link to="/chat" className={`relative font-medium transition-colors ${scrolled ? 'text-gray-700 dark:text-gray-200 hover:text-blue-600' : 'text-blue-900 dark:text-blue-100 hover:text-blue-700'}`}>
                  💬 {t('nav.messages')}
                  {notifications?.length > 0 && (
                    <span className="absolute -top-2 -right-5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                      {notifications.length}
                    </span>
                  )}
                </Link>

                {}
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-purple-600 dark:text-purple-300 hover:text-purple-800 font-bold bg-purple-50 dark:bg-purple-900/50 px-4 py-2 rounded-lg transition-all hover:bg-purple-100 dark:hover:bg-purple-900">
                    ⚡ {t('nav.admin')}
                  </Link>
                )}

                <div className="flex items-center gap-3">
                  {/* Theme Toggle Button */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {darkMode ? '☀️' : '🌙'}
                  </button>

                  {/* Language Switcher */}
                  <select
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                  >
                    <option value="en">🇬🇧 EN</option>
                    <option value="hi">🇮🇳 हिंदी</option>
                  </select>

                  <Link to="/profile" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1">
                    👋 {user.fullName?.split(' ')[0]}
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="px-5 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-all shadow-lg"
                  >
                    {t('nav.logout')}
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 border-2 border-blue-500 text-blue-600 dark:text-blue-300 dark:border-blue-400 rounded-full text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                  >
                    {t('nav.login')}
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-sm font-medium hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/25"
                  >
                    {t('nav.register')}
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-blue-900 dark:text-blue-100 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-700"
          >
            <div className="px-6 py-6 space-y-3">
              <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 rounded-xl">
                {t('nav.home')}
              </Link>
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 rounded-xl">
                    👤 {t('nav.profile')}
                  </Link>
                  <Link to="/properties" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 rounded-xl">
                    {t('nav.buy')}
                  </Link>
                  <Link to="/sell" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 rounded-xl">
                    {t('nav.sell')}
                  </Link>

                  <Link to="/chat" onClick={() => setIsOpen(false)} className="relative block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 rounded-xl">
                    💬 {t('nav.messages')}
                    {notifications?.length > 0 && (
                      <span className="absolute top-1 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </Link>

                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-purple-600 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-xl">
                      ⚡ {t('nav.admin')}
                    </Link>
                  )}

                  {}
                  <button
                    onClick={toggleTheme}
                    className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 rounded-xl flex items-center gap-2"
                  >
                    {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                  </button>

                  {}
                  <select
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded px-4 py-3 text-sm"
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="hi">🇮🇳 हिंदी</option>
                  </select>

                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl">
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl">
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar