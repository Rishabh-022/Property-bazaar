import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [propertiesList, setPropertiesList] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/admin/analytics', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAnalytics(data.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      const { data } = await axios.get('http://localhost:5000/api/admin/properties', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPropertiesList(data.properties || []);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'properties') {
      fetchProperties();
    }
  }, [activeTab]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/properties/${id}/verify`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('✅ Property approved!');
      fetchProperties();
      fetchAnalytics();
    } catch (err) {
      alert('Failed to approve property');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await axios.put(`http://localhost:5000/api/admin/properties/${id}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('❌ Property rejected');
      fetchProperties();
      fetchAnalytics();
    } catch (err) {
      alert('Failed to reject property');
    }
  };

  const viewPropertyDetails = async (id) => {
    try {
      setLoadingDetail(true);
      const { data } = await axios.get(`http://localhost:5000/api/admin/properties/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSelectedProperty(data.property);
      setShowModal(true);
    } catch (err) {
      alert('Failed to load property details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProperty(null);
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Crore`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} Lakhs`;
    return `₹${price.toLocaleString()}`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400"></div>
      </div>
    );

  if (!analytics)
    return <div className="text-center mt-20 dark:text-white">No data available</div>;

  const monthlyData = analytics.monthlyListings?.map(item => ({ month: item._id, listings: item.count })) || [];
  const typeData = analytics.typeCounts?.map(item => ({ name: item._id, value: item.count })) || [];
  const statusPieData = [
    { name: 'Pending', value: analytics.statusData?.Pending || 0 },
    { name: 'Active', value: analytics.statusData?.Active || 0 },
    { name: 'Rejected', value: analytics.statusData?.Rejected || 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 to-blue-50 dark:to-gray-800 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold font-display text-blue-950 dark:text-blue-200">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Manage properties and view analytics</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow px-4 py-2 flex gap-2">
            {['overview', 'properties', 'activity'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm capitalize ${
                  activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Properties', value: analytics.totalProperties, color: 'from-blue-500 to-blue-600' },
                { label: 'Total Users', value: analytics.totalUsers, color: 'from-green-500 to-green-600' },
                { label: 'Avg Price', value: `₹${(analytics.avgPrice/100000).toFixed(2)}L`, color: 'from-purple-500 to-purple-600' },
                { label: 'Avg Area', value: `${Math.round(analytics.avgArea)} sqft`, color: 'from-yellow-500 to-yellow-600' }
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }}
                  className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg`}>
                  <div className="text-sm opacity-80">{stat.label}</div>
                  <div className="text-2xl font-bold mt-1">{stat.value}</div>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-blue-950 dark:text-blue-200 mb-4">Monthly Listings (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" dark:stroke="#4a5568" />
                    <XAxis dataKey="month" stroke="#718096" />
                    <YAxis allowDecimals={false} stroke="#718096" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="listings" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-blue-950 dark:text-blue-200 mb-4">Property Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-blue-950 dark:text-blue-200 mb-4">Top Cities by Listings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {analytics.topCities?.map((city, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{city._id}</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{city.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {}
        {activeTab === 'properties' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-blue-950 dark:text-blue-200 mb-4">Property Verification Requests</h3>
            {loadingProperties ? (
              <div className="text-center py-10 dark:text-gray-300">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-3 font-semibold text-gray-600 dark:text-gray-300">Property Title</th>
                      <th className="p-3 font-semibold text-gray-600 dark:text-gray-300">Owner</th>
                      <th className="p-3 font-semibold text-gray-600 dark:text-gray-300">City</th>
                      <th className="p-3 font-semibold text-gray-600 dark:text-gray-300">Price</th>
                      <th className="p-3 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                      <th className="p-3 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertiesList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-500 dark:text-gray-400">No properties found.</td>
                      </tr>
                    ) : (
                      propertiesList.map((prop) => (
                        <tr key={prop._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{prop.title}</td>
                          <td className="p-3 text-gray-700 dark:text-gray-300">{prop.owner?.fullName || 'Unknown'}</td>
                          <td className="p-3 text-gray-700 dark:text-gray-300">{prop.address?.city}</td>
                          <td className="p-3 text-gray-700 dark:text-gray-300">{formatPrice(prop.pricing?.expectedPrice)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              prop.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                              prop.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {prop.status}
                            </span>
                          </td>
                          <td className="p-3 flex gap-2 flex-wrap">
                            <button
                              onClick={() => viewPropertyDetails(prop._id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                            >
                              👁️ View
                            </button>
                            {prop.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(prop._id)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                                >
                                  ✅ Approve
                                </button>
                                <button
                                  onClick={() => handleReject(prop._id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                                >
                                  ❌ Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-blue-950 dark:text-blue-200 mb-4">Recent Verification Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="p-3 text-gray-600 dark:text-gray-300">Property</th>
                    <th className="p-3 text-gray-600 dark:text-gray-300">Action</th>
                    <th className="p-3 text-gray-600 dark:text-gray-300">By</th>
                    <th className="p-3 text-gray-600 dark:text-gray-300">Date</th>
                    <th className="p-3 text-gray-600 dark:text-gray-300">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentActivity?.map((activity, idx) => (
                    <tr key={idx} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{activity.title}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          activity.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {activity.status === 'Active' ? 'Approved' : 'Rejected'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
                        {activity.verifiedBy?.fullName || activity.rejectedBy?.fullName || 'N/A'}
                      </td>
                      <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(activity.verifiedAt || activity.rejectedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                        {activity.rejectionReason || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {}
      {showModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-blue-950 dark:text-blue-200">{selectedProperty.title}</h2>
              <button onClick={closeModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl">&times;</button>
            </div>

            {selectedProperty.images && selectedProperty.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {selectedProperty.images.map((img, i) => (
                  <img key={i} src={img.url} alt="" className="w-full h-24 object-cover rounded-lg" />
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                <span className="text-xs text-gray-500 dark:text-gray-400">Property Type</span>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedProperty.propertyType}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                <span className="text-xs text-gray-500 dark:text-gray-400">Sub Type</span>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedProperty.propertySubType || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                <span className="text-xs text-gray-500 dark:text-gray-400">Area</span>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedProperty.dimensions?.area} {selectedProperty.dimensions?.areaUnit}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                <span className="text-xs text-gray-500 dark:text-gray-400">Price</span>
                <p className="font-semibold text-blue-600 dark:text-blue-400">{formatPrice(selectedProperty.pricing?.expectedPrice)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl col-span-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Address</span>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedProperty.address?.street}, {selectedProperty.address?.locality}, {selectedProperty.address?.city}, {selectedProperty.address?.state} - {selectedProperty.address?.pincode}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-blue-950 dark:text-blue-200 mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{selectedProperty.description}</p>
            </div>

            <h3 className="font-semibold text-blue-950 dark:text-blue-200 mb-2">Verification Documents</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
                <span className="text-xs text-green-700 dark:text-green-400 font-semibold">✅ Aadhaar Number</span>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{selectedProperty.aadhaarNumber}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold">📋 Registration No</span>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{selectedProperty.registrationNumber}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
                <span className="text-xs text-yellow-700 dark:text-yellow-400 font-semibold">📄 Khata Number</span>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{selectedProperty.khataNumber}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-3">
                <span className="text-xs text-purple-700 dark:text-purple-400 font-semibold">🏷️ Khasra Number</span>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{selectedProperty.khasraNumber || 'N/A'}</p>
              </div>
              {selectedProperty.panNumber && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3">
                  <span className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold">💳 PAN Number</span>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{selectedProperty.panNumber}</p>
                </div>
              )}
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3">
                <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">📞 Seller Phone</span>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{selectedProperty.sellerPhone}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 dark:from-blue-900/30 to-blue-100 dark:to-blue-900/20 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Seller Information</h3>
              <p className="text-sm text-gray-800 dark:text-gray-200"><strong>Name:</strong> {selectedProperty.sellerName}</p>
              <p className="text-sm text-gray-800 dark:text-gray-200"><strong>Email:</strong> {selectedProperty.owner?.email || 'N/A'}</p>
              <p className="text-sm text-gray-800 dark:text-gray-200"><strong>Phone:</strong> {selectedProperty.sellerPhone}</p>
              {selectedProperty.owner?.aadhaarNumber && (
                <p className="text-sm text-gray-800 dark:text-gray-200"><strong>Aadhaar:</strong> {selectedProperty.owner.aadhaarNumber}</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;