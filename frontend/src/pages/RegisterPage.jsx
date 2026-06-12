import { useState } from 'react';
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
      // Redirect to OTP verification page with the user's email
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      setError(err.response?.data?.message || t('register.registrationFailed'));
    } finally {
      setLoading(false);
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
            {t('register.joinTitle')}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-blue-100 text-lg"
          >
            {t('register.subtitle')}
          </motion.p>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mt-12 bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">✅</span>
              <div className="text-left">
                <div className="text-white font-semibold">{t('register.freeRegistration')}</div>
                <div className="text-blue-200 text-sm">{t('register.noCharges')}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            className="mt-4 bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🛡️</span>
              <div className="text-left">
                <div className="text-white font-semibold">{t('register.secureVerified')}</div>
                <div className="text-blue-200 text-sm">{t('register.aadhaarBhulekh')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side – register form */}
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

            <h2 className="text-3xl font-bold text-blue-950 mb-2">{t('register.createAccount')}</h2>
            <p className="text-gray-500 mb-8">{t('register.fillDetails')}</p>

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
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.fullName')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.email')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.phone')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.password')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.confirmPassword')}</label>
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

            <div className="mt-8 text-center">
              <p className="text-gray-500">
                {t('register.haveAccount')}{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                  {t('register.signIn')}
                </Link>
              </p>
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;