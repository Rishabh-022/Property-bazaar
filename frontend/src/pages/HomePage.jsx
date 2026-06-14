import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// ──────────────────────────────────────────────
// Reusable animated background component
// ──────────────────────────────────────────────
const BubbleBackground = ({ theme }) => {
  const bubbles = useMemo(() => {
    return [...Array(12)].map((_, i) => {
      let bgColor;
      if (theme === 'blue') {
        // White / transparent bubbles for dark blue backgrounds
        bgColor =
          i % 2 === 0
            ? 'rgba(255, 255, 255, 0.15)'
            : 'rgba(255, 255, 255, 0.05)';
      } else if (theme === 'light') {
        // Light blue bubbles for white / gray backgrounds
        bgColor =
          i % 2 === 0
            ? 'rgba(59, 130, 246, 0.08)'
            : 'rgba(147, 197, 253, 0.12)';
      } else {
        // Subtle slate bubbles for dark sections (footer, etc.)
        bgColor =
          i % 2 === 0
            ? 'rgba(255, 255, 255, 0.03)'
            : 'rgba(148, 163, 184, 0.05)';
      }

      return {
        id: i,
        size: Math.random() * 250 + 50,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        xDest: Math.random() * 100 - 50,
        yDest: Math.random() * 100 - 50,
        duration: Math.random() * 10 + 15,
        bg: bgColor,
      };
    });
  }, [theme]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            width: bubble.size,
            height: bubble.size,
            background: bubble.bg,
            left: bubble.left,
            top: bubble.top,
          }}
          animate={{ x: [0, bubble.xDest, 0], y: [0, bubble.yDest, 0] }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────
// HomePage Component
// ──────────────────────────────────────────────
const HomePage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [counters, setCounters] = useState({
    properties: 0,
    customers: 0,
    cities: 0,
    experience: 0,
  });

  const [featuredProperties, setFeaturedProperties] = useState([]);

  useEffect(() => {
    const targets = { properties: 2500, customers: 15000, cities: 50, experience: 10 };
    const duration = 2000;
    const steps = 50;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCounters({
        properties: Math.floor((targets.properties / steps) * step),
        customers: Math.floor((targets.customers / steps) * step),
        cities: Math.floor((targets.cities / steps) * step),
        experience: Math.floor((targets.experience / steps) * step),
      });

      if (step >= steps) {
        setCounters(targets);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/properties?limit=6&sort=newest');
      setFeaturedProperties(data.properties || []);
    } catch (err) {
      console.error('Failed to fetch featured properties:', err);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ============ HERO SECTION (blue background) ============ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-blue-600">
        <BubbleBackground theme="blue" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="flex flex-col-reverse xl:grid xl:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 shadow-lg"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-white font-medium text-sm">{t('home.trustedBy')}</span>
              </motion.div>

              <h1 className="text-5xl lg:text-7xl font-bold font-display text-white mb-6 leading-tight">
                {t('home.heroTitle')}
              </h1>

              <p className="text-lg text-blue-100 mb-8 max-w-xl leading-relaxed">
                {t('home.heroSubtitle')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link to="/properties">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-white text-blue-700 rounded-full font-semibold text-lg shadow-xl"
                    >
                      {t('home.exploreBtn')}
                    </motion.button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-white text-blue-700 rounded-full font-semibold text-lg shadow-xl"
                    >
                      {t('home.exploreBtn')}
                    </motion.button>
                  </Link>
                )}

                {user ? (
                  <Link to="/sell">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-blue-700 transition-colors"
                    >
                      {t('home.sellBtn')}
                    </motion.button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-blue-700 transition-colors"
                    >
                      {t('home.sellBtn')}
                    </motion.button>
                  </Link>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex gap-8 mt-12">
                {[
                  { num: '2,500+', label: t('home.stats.properties'), color: 'text-white' },
                  { num: '15,000+', label: t('home.stats.customers'), color: 'text-white' },
                  { num: '50+', label: t('home.stats.cities'), color: 'text-white' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.2 }}
                  >
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.num}</div>
                    <div className="text-blue-100 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column – Dynamic Top Property */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {featuredProperties.length > 0 ? (
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-white rounded-3xl shadow-2xl p-6 relative z-10 border border-gray-100"
                >
                  {/* Dynamic Image */}
                  <div className="rounded-2xl h-64 mb-6 overflow-hidden relative group">
                    {featuredProperties[0].images && featuredProperties[0].images.length > 0 ? (
                      <img
                        src={featuredProperties[0].images[0].url}
                        alt={featuredProperties[0].title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                        <span className="text-6xl">🏠</span>
                      </div>
                    )}

                    {featuredProperties[0].status === 'Active' && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ✅ Available
                      </div>
                    )}
                  </div>

                  {/* Dynamic Property Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-950">
                        {formatPrice(featuredProperties[0].pricing?.expectedPrice)}
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {featuredProperties[0].propertyType}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                      {featuredProperties[0].title}
                    </h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      📍 {featuredProperties[0].address?.city},{' '}
                      {featuredProperties[0].address?.state}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-600 font-medium pt-3 border-t border-gray-100">
                      <span>
                        📐 {featuredProperties[0].dimensions?.area}{' '}
                        {featuredProperties[0].dimensions?.areaUnit}
                      </span>
                    </div>

                    <Link
                      to={`/property/${featuredProperties[0]._id}`}
                      className="block w-full text-center mt-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                    >
                      View Top Property
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl shadow-2xl p-6 relative z-10 animate-pulse">
                  <div className="bg-gray-200 rounded-2xl h-64 mb-6"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mt-6"></div>
                </div>
              )}

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 z-20 border border-gray-100 hidden md:flex"
              >
                <span className="text-3xl">⭐</span>
                <div>
                  <div className="text-sm font-bold text-blue-900">#1 Top Rated</div>
                  <div className="text-xs text-yellow-600">Highest Views & Rating</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION (white background) ============ */}
      <section className="relative py-24 bg-white overflow-hidden">
        <BubbleBackground theme="light" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              {t('home.whyUs')}
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-blue-950 mt-4 mb-6">
              {t('home.smartWay')}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('home.verifiedDesc')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔒',
                title: t('home.verifiedDoc'),
                desc: t('home.verifiedDocDesc'),
                color: 'border-l-green-500',
                bg: 'bg-green-50',
                textColor: 'text-green-700',
              },
              {
                icon: '💰',
                title: t('home.bestPrice'),
                desc: t('home.bestPriceDesc'),
                color: 'border-l-blue-500',
                bg: 'bg-blue-50',
                textColor: 'text-blue-700',
              },
              {
                icon: '⚡',
                title: t('home.fastSecure'),
                desc: t('home.fastSecureDesc'),
                color: 'border-l-red-500',
                bg: 'bg-red-50',
                textColor: 'text-red-700',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className={`bg-white rounded-2xl p-8 border-l-4 ${feature.color} shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div
                  className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center text-2xl mb-6`}
                >
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold ${feature.textColor} mb-3`}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED PROPERTIES SECTION (gray background) ============ */}
      {featuredProperties.length > 0 && (
        <section className="relative py-24 bg-gray-50 overflow-hidden">
          <BubbleBackground theme="light" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                {t('home.latestListings')}
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold font-display text-blue-950 mt-4 mb-4">
                {t('home.featured')}
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                {t('home.featuredDesc')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property, index) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100 group"
                >
                  <div className="relative h-52 bg-blue-500 flex items-center justify-center overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0].url}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-6xl">🏠</span>
                    )}

                    <div className="absolute top-4 left-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        ✅ {t('home.verifiedBadge')}
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm text-blue-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        {formatPrice(property.pricing?.expectedPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-blue-950 line-clamp-1">
                        {property.title}
                      </h3>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ml-2">
                        {property.propertyType}
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                      📍 {property.address?.city}, {property.address?.state}
                    </p>

                    <div className="flex gap-4 mb-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        📐 {property.dimensions?.area} {property.dimensions?.areaUnit}
                      </span>
                    </div>

                    {user ? (
                      <Link
                        to={`/property/${property._id}`}
                        className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-center hover:bg-blue-700 transition-all shadow-md"
                      >
                        {t('home.viewDetails')}
                      </Link>
                    ) : (
                      <div className="text-center">
                        <Link
                          to="/login"
                          className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-center hover:bg-blue-700 transition-all shadow-md"
                        >
                          🔒 {t('home.loginToView')}
                        </Link>
                        <p className="text-xs text-gray-400 mt-2">
                          {t('home.registerPrompt')}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              {user ? (
                <Link to="/properties">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 border-2 border-blue-500 text-blue-600 rounded-full font-bold text-lg hover:bg-blue-50 transition-all"
                  >
                    {t('home.browseAll')}
                  </motion.button>
                </Link>
              ) : (
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 border-2 border-blue-500 text-blue-600 rounded-full font-bold text-lg hover:bg-blue-50 transition-all"
                  >
                    {t('home.loginToBrowse')}
                  </motion.button>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ CTA SECTION (blue background) ============ */}
      <section className="relative py-24 bg-blue-600 overflow-hidden">
        <BubbleBackground theme="blue" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-white mb-6">
              {t('home.cta')}
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              {t('home.ctaDesc')}
            </p>
            <Link to={user ? '/properties' : '/register'}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white text-blue-700 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all"
              >
                {user ? t('home.browseProperties') : t('home.getStarted')}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;