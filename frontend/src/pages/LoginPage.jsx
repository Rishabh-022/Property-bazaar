import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import API from '../utils/api'; // ✅ Swapped axios for your API utility

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const bubbles = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      size: Math.random() * 200 + 80,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      xDest: Math.random() * 60 - 30,
      yDest: Math.random() * 60 - 30,
      duration: Math.random() * 8 + 8,
      bg:
        i % 3 === 0
          ? 'rgba(255, 255, 255, 0.08)'
          : i % 3 === 1
          ? 'rgba(59, 130, 246, 0.15)'
          : 'rgba(239, 68, 68, 0.05)',
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || t('login.loginFailed');
      setError(message);
      if (err.response?.status === 403 && message.includes('verify your email')) {
        setUnverifiedEmail(formData.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      // ✅ Removed localhost and used API
      await API.post('/users/resend-otp', { email: unverifiedEmail });
      alert(t('login.otpResent'));
    } catch (err) {
      alert(err.response?.data?.message || t('login.otpFailed'));
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
      
      {/* Floating bubbles */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: bubble.size,
            height: bubble.size,
            background: bubble.bg,
            left: bubble.left,
            top: bubble.top,
          }}
          animate={{
            x: [0, bubble.xDest, 0],
            y: [0, bubble.yDest, 0],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Centered glass card – now includes stat badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
            PB
          </div>
          <h2 className="text-3xl font-bold text-slate-800">{t('login.welcomeBack')}</h2>
          <p className="text-slate-500 mt-2">{t('login.signInAccess')}</p>
        </div>

        {/* ---- TRUST BADGES ---- */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30">
            <div className="text-lg font-bold text-blue-600">2,500+</div>
            <div className="text-xs text-slate-600">{t('home.stats.properties')}</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30">
            <div className="text-lg font-bold text-green-600">✓</div>
            <div className="text-xs text-slate-600">{t('login.verifiedListings')}</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30">
            <div className="text-lg font-bold text-red-500">100%</div>
            <div className="text-xs text-slate-600">{t('login.secure')}</div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`px-4 py-3 rounded-xl mb-6 text-sm ${
              unverifiedEmail
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {error}
            {unverifiedEmail && (
              <div className="mt-2 flex gap-2">
                <button onClick={handleResendOTP} className="text-blue-600 font-semibold hover:underline">
                  {t('login.resendOTP')}
                </button>
                <Link to={`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`} className="text-blue-600 font-semibold hover:underline">
                  {t('login.verifyEmail')}
                </Link>
              </div>
            )}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('login.email')}</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder={t('login.emailPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('login.password')}</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? t('login.signingIn') : t('login.loginBtn')}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            {t('login.createAccount')}
          </Link>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">{t('general.or')}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-blue-300 hover:text-blue-600 transition-all"
          >
            {t('login.backHome')}
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default LoginPage;