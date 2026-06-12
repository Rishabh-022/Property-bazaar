import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [myProperties, setMyProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    aadhaarNumber: user?.aadhaarNumber || '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchMyProperties();
    } else if (activeTab === 'favorites') {
      fetchFavorites();
    }
  }, [activeTab]);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/properties/my-listings', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMyProperties(data.properties || []);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/users/favorites', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setFavorites(data.favorites || []);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    try {
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone
      };
      
      if (formData.aadhaarNumber) {
        updateData.aadhaarNumber = formData.aadhaarNumber;
      }
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const { data } = await axios.put('http://localhost:5000/api/users/profile', updateData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const updatedUser = { ...user, ...data.user, token: data.token || user.token };
      localStorage.setItem('propertyBazzarUser', JSON.stringify(updatedUser));
      
      setMessage(t('profile.updateSuccess'));
      setEditMode(false);
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || t('profile.updateFailed'));
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm(t('profile.confirmDelete'))) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMyProperties(myProperties.filter(p => p._id !== propertyId));
      alert(t('profile.deleteSuccess'));
    } catch (err) {
      alert(t('profile.deleteFailed') + (err.response?.data?.message || ''));
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Active': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700',
      'Sold': 'bg-blue-100 text-blue-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-bold font-display text-blue-950">{t('profile.myProfile')}</h1>
          <p className="text-gray-500 mt-2">{t('profile.manageAccount')}</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-2xl p-2 shadow-lg">
          <button onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'profile' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}>
            👤 {t('profile.profile')}
          </button>
          <button onClick={() => setActiveTab('listings')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'listings' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}>
            🏠 {t('profile.myListings')} ({myProperties.length})
          </button>
          <button onClick={() => setActiveTab('favorites')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'favorites' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}>
            ❤️ {t('profile.saved')} ({favorites.length})
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl">
            
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-950">{user?.fullName}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <span className="text-sm text-blue-600 font-medium">{user?.role === 'admin' ? '🔒 Admin' : '👤 User'}</span>
              </div>
            </div>

            {!editMode ? (
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-sm text-gray-500">{t('register.fullName')}</span>
                    <p className="font-semibold text-gray-800">{user?.fullName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-sm text-gray-500">{t('register.phone')}</span>
                    <p className="font-semibold text-gray-800">{user?.phone || t('profile.notProvided')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-sm text-gray-500">{t('register.email')}</span>
                    <p className="font-semibold text-gray-800">{user?.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-sm text-gray-500">{t('register.aadhaar')}</span>
                    <p className="font-semibold text-gray-800">{user?.aadhaarNumber || t('profile.notProvided')}</p>
                  </div>
                </div>
                
                <button onClick={() => setEditMode(true)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all">
                  ✏️ {t('profile.editProfile')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.fullName')}</label>
                  <input type="text" value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.phone')}</label>
                  <input type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.aadhaar')}</label>
                  <input type="text" value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    maxLength={12}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.newPassword')}</label>
                  <input type="password" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.confirmNewPassword')}</label>
                  <input type="password" value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex gap-3">
                  <button type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all">
                    💾 {t('profile.saveChanges')}
                  </button>
                  <button type="button" onClick={() => setEditMode(false)}
                    className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all">
                    {t('profile.cancel')}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* My Listings Tab */}
        {activeTab === 'listings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
            ) : myProperties.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <span className="text-6xl mb-4 block">🏠</span>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">{t('profile.noProperties')}</h3>
                <p className="text-gray-500 mb-6">{t('profile.noPropertiesDesc')}</p>
                <button onClick={() => navigate('/sell')}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all">
                  ➕ {t('profile.listFirst')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProperties.map((property) => (
                  <motion.div key={property._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="relative h-40 bg-blue-500 flex items-center justify-center">
                      {property.images?.[0]?.url ? (
                        <img src={property.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl">🏠</span>
                      )}
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(property.status)}`}>
                        {property.status}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-blue-950 mb-2 truncate">{property.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">
                        📍 {property.address?.city}, {property.address?.state}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-blue-600">{formatPrice(property.pricing?.expectedPrice)}</span>
                        <span className="text-xs text-gray-400">{property.dimensions?.area} {property.dimensions?.areaUnit}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/property/${property._id}`)}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">
                          👁️ {t('profile.view')}
                        </button>
                        <button onClick={() => handleDeleteProperty(property._id)}
                          className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all">
                          🗑️ {t('profile.delete')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Saved Favorites Tab */}
        {activeTab === 'favorites' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <span className="text-6xl mb-4 block">❤️</span>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">{t('profile.noSaved')}</h3>
                <p className="text-gray-500 mb-6">{t('profile.noSavedDesc')}</p>
                <button onClick={() => navigate('/properties')}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all">
                  {t('profile.browse')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((property) => (
                  <motion.div key={property._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 cursor-pointer"
                    onClick={() => navigate(`/property/${property._id}`)}>
                    <div className="relative h-40 bg-blue-500 flex items-center justify-center">
                      {property.images?.[0]?.url ? (
                        <img src={property.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl">🏠</span>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="text-red-500 text-xl">❤️</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-blue-950 mb-2 truncate">{property.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">
                        📍 {property.address?.city}, {property.address?.state}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600">{formatPrice(property.pricing?.expectedPrice)}</span>
                        <span className="text-xs text-gray-400">{property.dimensions?.area} {property.dimensions?.areaUnit}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;