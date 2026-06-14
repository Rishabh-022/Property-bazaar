import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api'; // ✅ Changed this import
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
  // New filter states
  const [filterBedrooms, setFilterBedrooms] = useState('');
  const [filterBathrooms, setFilterBathrooms] = useState('');
  const [filterFurnishing, setFilterFurnishing] = useState('');
  const [filterPossession, setFilterPossession] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // ✅ Updated to use the new API instance
      const { data } = await API.get('/properties');
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
      // ✅ Removed the hardcoded localhost URL
      let url = '/properties?';
      if (search) url += `city=${search}&`;
      if (filterType) url += `propertyType=${filterType}&`;
      if (filterPrice) {
        if (filterPrice === '0-50') { url += 'maxPrice=5000000&'; }
        else if (filterPrice === '50-100') { url += 'minPrice=5000000&maxPrice=10000000&'; }
        else if (filterPrice === '100-200') { url += 'minPrice=10000000&maxPrice=20000000&'; }
        else if (filterPrice === '200+') { url += 'minPrice=20000000&'; }
      }
      // Add new filters
      if (filterBedrooms) url += `bedrooms=${filterBedrooms}&`;
      if (filterBathrooms) url += `bathrooms=${filterBathrooms}&`;
      if (filterFurnishing) url += `furnishing=${filterFurnishing}&`;
      if (filterPossession) url += `possessionStatus=${filterPossession}&`;

      // ✅ Updated to use the new API instance
      const { data } = await API.get(url);
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
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Welcome, {user?.fullName?.split(' ')[0]} 👋
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold font-display text-blue-950 mt-4 mb-4">
            Find Your Perfect Property
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {properties.length} verified properties available
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-400"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
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
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
            >
              <option value="">All Prices</option>
              <option value="0-50">Under ₹50 Lakhs</option>
              <option value="50-100">₹50 Lakhs - ₹1 Cr</option>
              <option value="100-200">₹1 Cr - ₹2 Cr</option>
              <option value="200+">Above ₹2 Cr</option>
            </select>
            {/* New Filters */}
            <select
              value={filterBedrooms}
              onChange={(e) => setFilterBedrooms(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
            >
              <option value="">Beds: Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
            <select
              value={filterBathrooms}
              onChange={(e) => setFilterBathrooms(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
            >
              <option value="">Baths: Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
            <select
              value={filterFurnishing}
              onChange={(e) => setFilterFurnishing(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
            >
              <option value="">Furnishing: Any</option>
              <option value="Furnished">Furnished</option>
              <option value="Semi-Furnished">Semi-Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
            <select
              value={filterPossession}
              onChange={(e) => setFilterPossession(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
            >
              <option value="">Possession: Any</option>
              <option value="Ready to Move">Ready to Move</option>
              <option value="Under Construction">Under Construction</option>
            </select>
            <button onClick={handleSearch}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all lg:col-span-2">
              Search
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
            <button onClick={fetchProperties} className="mt-4 text-blue-600 underline">Try Again</button>
          </div>
        )}

        {/* Property Cards */}
        {!loading && !error && (
          <>
            {properties.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-6xl mb-4 block">🏠</span>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Properties Found</h3>
                <p className="text-gray-500">Try adjusting your search filters</p>
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
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100 cursor-pointer">

                    <div className="relative h-48 bg-blue-500 flex items-center justify-center">
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
                        <h3 className="text-lg font-bold text-blue-950">{property.title}</h3>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                          {property.propertyType}
                        </span>
                      </div>

                      <p className="text-gray-500 text-sm mb-4">
                        📍 {property.address?.city}, {property.address?.state}
                      </p>

                      <div className="flex gap-4 mb-4 text-sm text-gray-600">
                        <span>📐 {property.dimensions?.area} {property.dimensions?.areaUnit}</span>
                        {property.bedrooms > 0 && <span>🛏️ {property.bedrooms} Beds</span>}
                        {property.bathrooms > 0 && <span>🛁 {property.bathrooms} Baths</span>}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="text-2xl font-bold text-blue-600">
                          ₹{(property.pricing?.expectedPrice / 100000).toFixed(1)} L
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/property/${property._id}`); }}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium shadow-md transition-all">
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