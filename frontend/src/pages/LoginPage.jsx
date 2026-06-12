import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      await axios.post('http://localhost:5000/api/users/resend-otp', { email: unverifiedEmail });
      alert(t('login.otpResent'));
    } catch (err) {
      alert(err.response?.data?.message || t('login.otpFailed'));
    }
  };

  return (
    <div className="min-h-screen pt-24 flex flex-col lg:flex-row bg-blue-50">
      
      {/* Left side – branding (only visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-blue-600 relative overflow-hidden">
        {/* decorative floating circles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 0.9, 1],
              x: [0, 30, -20, 0],
              y: [0, -30, 20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <span className="text-blue-700 font-bold text-4xl">PB</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold font-display text-white mb-4"
          >
            {t('login.welcomeBack')}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-blue-100 text-lg"
          >
            {t('login.signInAccess')}
          </motion.p>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mt-12 bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🏠</span>
              <div className="text-left">
                <div className="text-white font-semibold">{t('login.statsProperties')}</div>
                <div className="text-blue-200 text-sm">{t('login.verifiedListings')}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            className="mt-4 bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🔒</span>
              <div className="text-left">
                <div className="text-white font-semibold">{t('login.secure')}</div>
                <div className="text-blue-200 text-sm">{t('login.docVerified')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side – login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">PB</span>
              </div>
              <h2 className="text-2xl font-bold font-display text-blue-950">PropertyBazzar</h2>
            </div>

            <h2 className="text-3xl font-bold text-blue-950 mb-2">{t('login.signIn')}</h2>
            <p className="text-gray-500 mb-8">{t('login.enterCredentials')}</p>

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
                    <button
                      onClick={handleResendOTP}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {t('login.resendOTP')}
                    </button>
                    <Link
                      to={`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {t('login.verifyEmail')}
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.email')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.password')}</label>
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
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('login.signingIn')}
                  </span>
                ) : t('login.loginBtn')}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500">
                {t('login.noAccount')}{' '}
                <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">
                  {t('login.createAccount')}
                </Link>
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400">{t('general.or')}</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                {t('login.backHome')}
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;