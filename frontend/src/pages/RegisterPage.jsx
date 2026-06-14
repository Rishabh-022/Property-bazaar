import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('register.passwordLength'));
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/users/register', formData);
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      setError(err.response?.data?.message || t('register.registrationFailed'));
    } finally {
      setLoading(false);
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

      {/* Centered glass card with trust badges */}
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
          <h2 className="text-3xl font-bold text-slate-800">{t('register.joinTitle')}</h2>
          <p className="text-slate-500 mt-2">{t('register.subtitle')}</p>
        </div>

        {/* ---- TRUST BADGES ---- */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30">
            <div className="text-lg font-bold text-blue-600">Free</div>
            <div className="text-xs text-slate-600">{t('register.freeRegistration')}</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30">
            <div className="text-lg font-bold text-green-600">🛡️</div>
            <div className="text-xs text-slate-600">{t('register.secureVerified')}</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30">
            <div className="text-lg font-bold text-red-500">Aadhaar</div>
            <div className="text-xs text-slate-600">{t('register.aadhaarBhulekh')}</div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('register.fullName')}</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder={t('register.fullNamePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('register.email')}</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder={t('register.emailPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('register.phone')}</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('register.password')}</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder={t('register.passwordPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('register.confirmPassword')}</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder={t('register.confirmPasswordPlaceholder')}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('register.creating')}
              </span>
            ) : t('register.registerBtn')}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {t('register.haveAccount')}{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            {t('register.signIn')}
          </Link>
        </div>

        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-blue-300 hover:text-blue-600 transition-all"
          >
            {t('register.backHome')}
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default RegisterPage;