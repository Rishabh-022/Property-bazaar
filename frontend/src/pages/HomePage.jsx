import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const HomePage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [counters, setCounters] = useState({
    properties: 0,
    customers: 0,
    cities: 0,
    experience: 0
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
        experience: Math.floor((targets.experience / steps) * step)
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      
      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-screen flex items-center overflow-hidden" 
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 25%, #bfdbfe 50%, #93c5fd 75%, #60a5fa 100%)'
        }}
      >
        {/* Animated floating circles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              background: i % 3 === 0 
                ? 'rgba(255, 255, 255, 0.3)' 
                : i % 3 === 1 
                  ? 'rgba(59, 130, 246, 0.1)' 
                  : 'rgba(239, 68, 68, 0.05)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
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
                className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 shadow-lg"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-blue-900 dark:text-blue-200 font-medium text-sm">{t('home.trustedBy')}</span>
              </motion.div>

              <h1 className="text-5xl lg:text-7xl font-bold font-display text-blue-950 dark:text-blue-200 mb-6 leading-tight">
                {t('home.heroTitle')}
              </h1>
              
              <p className="text-lg text-blue-800/70 dark:text-blue-300/80 mb-8 max-w-xl leading-relaxed">
                {t('home.heroSubtitle')}
              </p>

              {/* CTA Buttons – dynamic based on login */}
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link to="/properties">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold text-lg shadow-xl"
                    >
                      {t('home.exploreBtn')}
                    </motion.button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold text-lg shadow-xl"
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
                      className="px-8 py-4 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 rounded-full font-semibold text-lg border-2 border-blue-200 dark:border-blue-400 hover:border-blue-400 shadow-lg"
                    >
                      {t('home.sellBtn')}
                    </motion.button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 rounded-full font-semibold text-lg border-2 border-blue-200 dark:border-blue-400 hover:border-blue-400 shadow-lg"
                    >
                      {t('home.sellBtn')}
                    </motion.button>
                  </Link>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex gap-8 mt-12">
                {[
                  { num: '2,500+', label: t('home.stats.properties'), color: 'text-blue-600 dark:text-blue-400' },
                  { num: '15,000+', label: t('home.stats.customers'), color: 'text-green-600 dark:text-green-400' },
                  { num: '50+', label: t('home.stats.cities'), color: 'text-red-500 dark:text-red-400' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.2 }}
                  >
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.num}</div>
                    <div className="text-blue-800/60 dark:text-blue-300/70 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Visual (unchanged) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 relative z-10"
              >
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl h-64 mb-6 flex items-center justify-center">
                  <span className="text-6xl">🏠</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-950 dark:text-blue-200">₹1.5 Cr</span>
                    <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">Available</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Luxury 3BHK Apartment</h3>
                  <p className="text-gray-500 dark:text-gray-400">Mumbai, Maharashtra</p>
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <span>🛏️ 3 Beds</span>
                    <span>🛁 2 Baths</span>
                    <span>📐 1200 sqft</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-8 -right-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 flex items-center gap-3 z-20"
              >
                <span className="text-2xl">🔒</span>
                <div>
                  <div className="text-sm font-semibold text-blue-900 dark:text-blue-200">Verified</div>
                  <div className="text-xs text-green-600 dark:text-green-400">Bhulekh Approved</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 flex items-center gap-3 z-20"
              >
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="text-sm font-semibold text-blue-900 dark:text-blue-200">Premium</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">Top Rated</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider">{t('home.whyUs')}</span>
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-blue-950 dark:text-blue-200 mt-4 mb-6">
              {t('home.smartWay')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
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
                bg: 'bg-green-50 dark:bg-green-900/30',
                textColor: 'text-green-700 dark:text-green-400'
              },
              {
                icon: '💰',
                title: t('home.bestPrice'),
                desc: t('home.bestPriceDesc'),
                color: 'border-l-blue-500',
                bg: 'bg-blue-50 dark:bg-blue-900/30',
                textColor: 'text-blue-700 dark:text-blue-400'
              },
              {
                icon: '⚡',
                title: t('home.fastSecure'),
                desc: t('home.fastSecureDesc'),
                color: 'border-l-red-500',
                bg: 'bg-red-50 dark:bg-red-900/30',
                textColor: 'text-red-700 dark:text-red-400'
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-8 border-l-4 ${feature.color} shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center text-2xl mb-6`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold ${feature.textColor} mb-3`}>{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED PROPERTIES SECTION ============ */}
      {featuredProperties.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-white dark:from-gray-900 to-blue-50 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider">
                {t('home.latestListings')}
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold font-display text-blue-950 dark:text-blue-200 mt-4 mb-4">
                {t('home.featured')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
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
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100 dark:border-gray-700 group"
                >
                  <div className="relative h-52 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center overflow-hidden">
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
                      <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-blue-900 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        {formatPrice(property.pricing?.expectedPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-blue-950 dark:text-blue-200 line-clamp-1">{property.title}</h3>
                      <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ml-2">
                        {property.propertyType}
                      </span>
                    </div>
                    
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex items-center gap-1">
                      📍 {property.address?.city}, {property.address?.state}
                    </p>
                    
                    <div className="flex gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
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
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
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
                    className="px-10 py-4 border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300 rounded-full font-bold text-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                  >
                    {t('home.browseAll')}
                  </motion.button>
                </Link>
              ) : (
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300 rounded-full font-bold text-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                  >
                    {t('home.loginToBrowse')}
                  </motion.button>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ CTA SECTION ============ */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-gray-900">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-white mb-6">
              {t('home.cta')}
            </h2>
            <p className="text-blue-100 dark:text-blue-300 text-lg mb-8">
              {t('home.ctaDesc')}
            </p>
            <Link to={user ? "/properties" : "/register"}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all"
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