import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FavoriteButton from '../components/FavoriteButton';

const BuyPropertyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPrice, setFilterPrice] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/properties');
      setProperties(data.properties || []);
    } catch (err) {
      setError('Failed to load properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/properties?';
      if (search) url += `city=${search}&`;
      if (filterType) url += `propertyType=${filterType}&`;
      if (filterPrice) {
        if (filterPrice === '0-50') { url += 'maxPrice=5000000&'; }
        else if (filterPrice === '50-100') { url += 'minPrice=5000000&maxPrice=10000000&'; }
        else if (filterPrice === '100-200') { url += 'minPrice=10000000&maxPrice=20000000&'; }
        else if (filterPrice === '200+') { url += 'minPrice=20000000&'; }
      }

      const { data } = await axios.get(url);
      setProperties(data.properties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyImage = (property) => {
    if (property.images && property.images.length > 0) {
      return property.images[0].url;
    }
    return null;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider">
            Welcome, {user?.fullName?.split(' ')[0]} 👋
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold font-display text-blue-950 dark:text-blue-200 mt-4 mb-4">
            Find Your Perfect Property
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            {properties.length} verified properties available
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-200"
            >
              <option value="">All Types</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Agricultural">Agricultural</option>
              <option value="Plot">Plot</option>
            </select>

            <select
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-200"
            >
              <option value="">All Prices</option>
              <option value="0-50">Under ₹50 Lakhs</option>
              <option value="50-100">₹50 Lakhs - ₹1 Cr</option>
              <option value="100-200">₹1 Cr - ₹2 Cr</option>
              <option value="200+">Above ₹2 Cr</option>
            </select>

            <button onClick={handleSearch}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
              Search
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400 text-lg">{error}</p>
            <button onClick={fetchProperties} className="mt-4 text-blue-600 dark:text-blue-400 underline">Try Again</button>
          </div>
        )}

        {/* Property Cards */}
        {!loading && !error && (
          <>
            {properties.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-6xl mb-4 block">🏠</span>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">No Properties Found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property, index) => (
                  <motion.div
                    key={property._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    onClick={() => navigate(`/property/${property._id}`)}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer">

                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      {getPropertyImage(property) ? (
                        <img src={getPropertyImage(property)} alt={property.title}
                          className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-6xl">🏠</span>
                      )}
                      {property.status === 'Active' && (
                        <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          ✅ Active
                        </span>
                      )}
                      <div className="absolute top-4 left-4 z-10">
                        <FavoriteButton propertyId={property._id} />
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-blue-950 dark:text-blue-200">{property.title}</h3>
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-xs font-medium">
                          {property.propertyType}
                        </span>
                      </div>

                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        📍 {property.address?.city}, {property.address?.state}
                      </p>

                      <div className="flex gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>📐 {property.dimensions?.area} {property.dimensions?.areaUnit}</span>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ₹{(property.pricing?.expectedPrice / 100000).toFixed(1)} L
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/property/${property._id}`); }}
                          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all">
                          View Details
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BuyPropertyPage;