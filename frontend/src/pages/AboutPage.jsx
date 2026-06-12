import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🔐',
    title: 'Secure Authentication',
    desc: 'Email/Password registration with OTP verification. JWT‑based protected routes ensure only verified users can list properties.',
    color: 'border-l-green-500',
    bg: 'bg-green-50',
    textColor: 'text-green-700'
  },
  {
    icon: '🏘️',
    title: 'Smart Property Management',
    desc: 'Multi‑step listing form with Aadhaar, Registration, Khata, Khasra. Multi‑image upload via Cloudinary (up to 10 images).',
    color: 'border-l-blue-500',
    bg: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    icon: '💬',
    title: 'Real‑time Chat',
    desc: 'Buyer‑Seller chat powered by Socket.io with typing indicators, message notifications, and conversation history.',
    color: 'border-l-purple-500',
    bg: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  {
    icon: '⭐',
    title: 'Reviews & Ratings',
    desc: 'Property reviews with star ratings and sentiment analysis. Users can share listings on WhatsApp, Facebook, Twitter.',
    color: 'border-l-yellow-500',
    bg: 'bg-yellow-50',
    textColor: 'text-yellow-700'
  },
  {
    icon: '📊',
    title: 'Admin Dashboard',
    desc: 'Analytics with Recharts (monthly listings, status distribution, top cities). Property verification with PDF report generation.',
    color: 'border-l-red-500',
    bg: 'bg-red-50',
    textColor: 'text-red-700'
  },
  {
    icon: '🤖',
    title: 'AI‑Powered Features',
    desc: 'AI property descriptions via Google Gemini. NLP‑powered support chatbot for instant answers.',
    color: 'border-l-indigo-500',
    bg: 'bg-indigo-50',
    textColor: 'text-indigo-700'
  },
  {
    icon: '🌐',
    title: 'Multi‑language Support',
    desc: 'English & Hindi translations with react‑i18next. Language switcher in navbar for seamless experience.',
    color: 'border-l-teal-500',
    bg: 'bg-teal-50',
    textColor: 'text-teal-700'
  },
  {
    icon: '🗺️',
    title: 'Google Maps Integration',
    desc: 'Property location displayed on an interactive map with automatic geocoding from the address.',
    color: 'border-l-orange-500',
    bg: 'bg-orange-50',
    textColor: 'text-orange-700'
  },
  {
    icon: '📧',
    title: 'Email Notifications',
    desc: 'OTP verification emails. Approval/Rejection emails with PDF property reports. Nodemailer integration.',
    color: 'border-l-cyan-500',
    bg: 'bg-cyan-50',
    textColor: 'text-cyan-700'
  },
  {
    icon: '❤️',
    title: 'Wishlist & Favorites',
    desc: 'Users can save properties to their wishlist with a heart toggle. View saved items in profile.',
    color: 'border-l-pink-500',
    bg: 'bg-pink-50',
    textColor: 'text-pink-700'
  },
  {
    icon: '💳',
    title: 'Payment Ready',
    desc: 'Razorpay integration for booking/token payments. Test mode available for development.',
    color: 'border-l-emerald-500',
    bg: 'bg-emerald-50',
    textColor: 'text-emerald-700'
  },
  {
    icon: '📋',
    title: 'Status History',
    desc: 'Complete audit trail of property status changes (Pending → Active → Rejected). Visible to owners and admins.',
    color: 'border-l-amber-500',
    bg: 'bg-amber-50',
    textColor: 'text-amber-700'
  },
];

const technologies = [
  'React', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'Cloudinary',
  'Tailwind CSS', 'Framer Motion', 'Recharts', 'react‑i18next', 'Nodemailer',
  'PDFKit', 'Google Gemini AI', 'Google Maps', 'Razorpay', 'JWT', 'bcrypt'
];

const AboutPage = () => {
  return (
    <div className="min-h-screen pt-28 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* ========== HERO SECTION ========== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            About PropertyBazzar
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold text-blue-950 mt-4 mb-6">
            Revolutionising Real Estate in India
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            PropertyBazzar was founded with a single mission: to make buying, selling, and renting properties 
            completely transparent, secure, and hassle‑free. We combine cutting‑edge technology with strict 
            manual verification to ensure every listing is 100% authentic.
          </p>
        </motion.div>

        {/* ========== STATISTICS ========== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { number: '2,500+', label: 'Verified Properties' },
            { number: '15,000+', label: 'Happy Families' },
            { number: '50+', label: 'Cities Covered' },
            { number: '100%', label: 'Secure Transactions' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center"
            >
              <h3 className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</h3>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ========== FEATURES SECTION ========== */}
        <div className="mb-20">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-blue-950 text-center mb-12"
          >
            Everything You Need, Built In
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                className={`bg-white rounded-2xl p-6 border-l-4 ${feature.color} shadow-md hover:shadow-xl transition-all duration-300`}
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className={`text-lg font-bold ${feature.textColor} mb-2`}>{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ========== TECH STACK ========== */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-20 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-blue-950 mb-6 text-center">Built With Modern Technology</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {technologies.map((tech, i) => (
              <span 
                key={i}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ========== FOUNDER / CTA ========== */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-10 md:p-16 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold mb-6">Built by Trust. Driven by Tech.</h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              We leverage modern technology, AI, and strict manual verification to ensure that every property 
              listed on our platform is 100% authentic. Say goodbye to fake listings and hidden fees.
            </p>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm text-xl">
                🏠
              </div>
              <div>
                <div className="font-bold">Rishabh Tiwari</div>
                <div className="text-sm text-blue-200">Founder, PropertyBazzar</div>
              </div>
            </div>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-blue-700 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Join PropertyBazzar Today
              </motion.button>
            </Link>
          </div>
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-20 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl transform translate-y-1/2"></div>
        </motion.div>

      </div>
    </div>
  );
};

export default AboutPage;