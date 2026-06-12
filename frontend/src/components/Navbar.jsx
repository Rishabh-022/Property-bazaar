import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'   // ← useLocation added
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useTranslation } from 'react-i18next'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const { notifications } = useSocket()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()                      // ← track current URL

  const isHomePage = location.pathname === '/'        // ← true only on home

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

  // ---------- Dynamic styling that respects the current page ----------
  // Navbar background
  const navBg = scrolled || !isHomePage
    ? 'bg-white/95 backdrop-blur-md shadow-lg'
    : 'bg-transparent'

  // Link / text style
  const linkClass = `font-semibold px-4 py-2 rounded-full transition-all duration-200 text-sm xl:text-base ${
    scrolled || !isHomePage
      ? 'text-slate-800 hover:bg-slate-100 hover:text-blue-600'
      : 'text-white hover:bg-white/20 hover:text-white'
  }`

  // Login button outline
  const loginBtnClass = `px-5 py-2 rounded-full text-sm font-semibold transition-all border-2 ${
    scrolled || !isHomePage
      ? 'border-blue-600 text-blue-700 hover:bg-blue-50'
      : 'border-white text-white hover:bg-white/20'
  }`

  // Language switcher container
  const langSelectClass = `appearance-none backdrop-blur-md border font-semibold py-2.5 pl-11 pr-10 rounded-full shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${
    scrolled || !isHomePage
      ? 'bg-white/80 border-slate-200 text-slate-800'
      : 'bg-white/20 border-white/30 text-white'
  }`

  const langArrowClass = `absolute inset-y-0 right-4 flex items-center pointer-events-none text-xs ${
    scrolled || !isHomePage ? 'text-slate-400' : 'text-white/70'
  }`

  // Brand / logo text
  const brandTextClass = `text-2xl font-bold font-display ${
    scrolled || !isHomePage ? 'text-blue-950' : 'text-white'
  }`

  // Profile link
  const profileLinkClass = `text-sm transition-colors flex items-center gap-1 font-semibold ${
    scrolled || !isHomePage ? 'text-slate-800 hover:text-blue-600' : 'text-white hover:text-blue-200'
  }`

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-xl">PB</span>
            </motion.div>
            <span className={brandTextClass}>
              Property<span className="text-yellow-500">Bazzar</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-3">
            <Link to="/" className={linkClass}>
              {t('nav.home')}
            </Link>

            {user ? (
              <>
                <Link to="/properties" className={linkClass}>
                  {t('nav.buy')}
                </Link>
                <Link to="/sell" className={linkClass}>
                  {t('nav.sell')}
                </Link>
                <Link to="/chat" className={`${linkClass} relative`}>
                  💬 {t('nav.messages')}
                  {notifications?.length > 0 && (
                    <span className="absolute -top-2 -right-5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                      {notifications.length}
                    </span>
                  )}
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold border border-white/20 backdrop-blur-sm transition-all text-sm xl:text-base"
                  >
                    ⚡ {t('nav.admin')}
                  </Link>
                )}

                <div className="flex items-center gap-3 ml-2">
                  {/* Language Switcher */}
                  <div className="relative hidden md:block">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                      <span className="text-lg">🌐</span>
                    </div>
                    <select
                      value={i18n.language}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className={langSelectClass}
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी</option>
                    </select>
                    <div className={langArrowClass}>▼</div>
                  </div>

                  <Link to="/profile" className={profileLinkClass}>
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
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={loginBtnClass}>
                    {t('nav.login')}
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-sm font-semibold hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/25"
                  >
                    {t('nav.register')}
                  </motion.button>
                </Link>

                <div className="relative hidden md:block ml-2">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                    <span className="text-lg">🌐</span>
                  </div>
                  <select
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className={langSelectClass}
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                  </select>
                  <div className={langArrowClass}>▼</div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-blue-900 p-2">
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

      {/* Mobile Menu (same as before – no changes needed) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t"
          >
            <div className="px-6 py-6 space-y-3">
              <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl">
                {t('nav.home')}
              </Link>
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl">
                    👤 {t('nav.profile')}
                  </Link>
                  <Link to="/properties" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl">
                    {t('nav.buy')}
                  </Link>
                  <Link to="/sell" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl">
                    {t('nav.sell')}
                  </Link>
                  <Link to="/chat" onClick={() => setIsOpen(false)} className="relative block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl">
                    💬 {t('nav.messages')}
                    {notifications?.length > 0 && (
                      <span className="absolute top-1 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-purple-600 font-bold bg-purple-50 hover:bg-purple-100 rounded-xl">
                      ⚡ {t('nav.admin')}
                    </Link>
                  )}
                  <select
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="w-full bg-transparent border border-gray-300 rounded px-4 py-3 text-sm"
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="hi">🇮🇳 हिंदी</option>
                  </select>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl">
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-xl">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl">
                    {t('nav.register')}
                  </Link>
                  <select
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="w-full bg-transparent border border-gray-300 rounded px-4 py-3 text-sm mt-2"
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="hi">🇮🇳 हिंदी</option>
                  </select>
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