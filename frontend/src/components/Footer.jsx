import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-[#0a0f1a] border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">PB</span>
              </div>
              <span className="text-2xl font-bold font-display text-gray-900 dark:text-white">
                Property<span className="text-yellow-500 dark:text-yellow-400">Bazzar</span>
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md leading-relaxed">
              Your trusted platform for buying and selling properties across India. Secure, transparent, and hassle-free real estate transactions.
            </p>
            <div className="flex space-x-3">
              {['FB', 'TW', 'IG', 'LN'].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 text-sm hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link to="/properties" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Buy Property</Link></li>
              <li><Link to="/sell" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sell Property</Link></li>
              <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Contact</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li>📧 propertybazzarsupport@gmail.com</li>
              <li>📞 +91 95551 98215</li>
              <li>📍 Lucknow, Uttar Pradesh</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            © 2026 PropertyBazzar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer