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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );

  if (!analytics)
    return <div className="text-center mt-20">No data available</div>;

  const monthlyData = analytics.monthlyListings?.map(item => ({ month: item._id, listings: item.count })) || [];
  const typeData = analytics.typeCounts?.map(item => ({ name: item._id, value: item.count })) || [];
  const statusPieData = [
    { name: 'Pending', value: analytics.statusData?.Pending || 0 },
    { name: 'Active', value: analytics.statusData?.Active || 0 },
    { name: 'Rejected', value: analytics.statusData?.Rejected || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold font-display text-blue-950">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage properties and view analytics</p>
          </div>
          <div className="bg-white rounded-xl shadow px-4 py-2 flex gap-2">
            {['overview', 'properties', 'activity'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm capitalize ${
                  activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
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
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-blue-950 mb-4">Monthly Listings (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#718096" />
                    <YAxis allowDecimals={false} stroke="#718096" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="listings" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-blue-950 mb-4">Property Status Distribution</h3>
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
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-blue-950 mb-4">Top Cities by Listings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {analytics.topCities?.map((city, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-sm text-gray-500">{city._id}</div>
                    <div className="text-xl font-bold text-blue-600">{city.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-blue-950 mb-4">Property Verification Requests</h3>
            {loadingProperties ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 font-semibold text-gray-600">Property Title</th>
                      <th className="p-3 font-semibold text-gray-600">Owner</th>
                      <th className="p-3 font-semibold text-gray-600">City</th>
                      <th className="p-3 font-semibold text-gray-600">Price</th>
                      <th className="p-3 font-semibold text-gray-600">Status</th>
                      <th className="p-3 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertiesList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-500">No properties found.</td>
                      </tr>
                    ) : (
                      propertiesList.map((prop) => (
                        <tr key={prop._id} className="border-t hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900">{prop.title}</td>
                          <td className="p-3 text-gray-700">{prop.owner?.fullName || 'Unknown'}</td>
                          <td className="p-3 text-gray-700">{prop.address?.city}</td>
                          <td className="p-3 text-gray-700">{formatPrice(prop.pricing?.expectedPrice)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              prop.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                              prop.status === 'Active' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
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

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-blue-950 mb-4">Recent Verification Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-gray-600">Property</th>
                    <th className="p-3 text-gray-600">Action</th>
                    <th className="p-3 text-gray-600">By</th>
                    <th className="p-3 text-gray-600">Date</th>
                    <th className="p-3 text-gray-600">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentActivity?.map((activity, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{activity.title}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          activity.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {activity.status === 'Active' ? 'Approved' : 'Rejected'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {activity.verifiedBy?.fullName || activity.rejectedBy?.fullName || 'N/A'}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {new Date(activity.verifiedAt || activity.rejectedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
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

      {/* Modal */}
      {showModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-blue-950">{selectedProperty.title}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            {selectedProperty.images && selectedProperty.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {selectedProperty.images.map((img, i) => (
                  <img key={i} src={img.url} alt="" className="w-full h-24 object-cover rounded-lg" />
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-xs text-gray-500">Property Type</span>
                <p className="font-semibold text-gray-900">{selectedProperty.propertyType}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-xs text-gray-500">Sub Type</span>
                <p className="font-semibold text-gray-900">{selectedProperty.propertySubType || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-xs text-gray-500">Area</span>
                <p className="font-semibold text-gray-900">{selectedProperty.dimensions?.area} {selectedProperty.dimensions?.areaUnit}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-xs text-gray-500">Price</span>
                <p className="font-semibold text-blue-600">{formatPrice(selectedProperty.pricing?.expectedPrice)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                <span className="text-xs text-gray-500">Address</span>
                <p className="font-semibold text-gray-900">{selectedProperty.address?.street}, {selectedProperty.address?.locality}, {selectedProperty.address?.city}, {selectedProperty.address?.state} - {selectedProperty.address?.pincode}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-blue-950 mb-2">Description</h3>
              <p className="text-gray-600 text-sm">{selectedProperty.description}</p>
            </div>

            <h3 className="font-semibold text-blue-950 mb-2">Verification Documents</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <span className="text-xs text-green-700 font-semibold">✅ Aadhaar Number</span>
                <p className="font-mono text-sm text-gray-900">{selectedProperty.aadhaarNumber}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <span className="text-xs text-blue-700 font-semibold">📋 Registration No</span>
                <p className="font-mono text-sm text-gray-900">{selectedProperty.registrationNumber}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <span className="text-xs text-yellow-700 font-semibold">📄 Khata Number</span>
                <p className="font-mono text-sm text-gray-900">{selectedProperty.khataNumber}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                <span className="text-xs text-purple-700 font-semibold">🏷️ Khasra Number</span>
                <p className="font-mono text-sm text-gray-900">{selectedProperty.khasraNumber || 'N/A'}</p>
              </div>
              {selectedProperty.panNumber && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                  <span className="text-xs text-indigo-700 font-semibold">💳 PAN Number</span>
                  <p className="font-mono text-sm text-gray-900">{selectedProperty.panNumber}</p>
                </div>
              )}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <span className="text-xs text-gray-700 font-semibold">📞 Seller Phone</span>
                <p className="font-mono text-sm text-gray-900">{selectedProperty.sellerPhone}</p>
              </div>
            </div>

            {/* Status History */}
            {selectedProperty.statusHistory && selectedProperty.statusHistory.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-blue-950 mb-3">📋 Status History</h3>
                <div className="space-y-2">
                  {selectedProperty.statusHistory.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          entry.status === 'Active' ? 'bg-green-100 text-green-700' :
                          entry.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {entry.status}
                        </span>
                        <span className="text-sm text-gray-700">{entry.note || '-'}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(entry.changedAt).toLocaleString('en-IN')}
                        </p>
                        {entry.changedBy && (
                          <p className="text-xs text-gray-500">by {entry.changedBy.fullName}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Seller Information</h3>
              <p className="text-sm text-gray-800"><strong>Name:</strong> {selectedProperty.sellerName}</p>
              <p className="text-sm text-gray-800"><strong>Email:</strong> {selectedProperty.owner?.email || 'N/A'}</p>
              <p className="text-sm text-gray-800"><strong>Phone:</strong> {selectedProperty.sellerPhone}</p>
              {selectedProperty.owner?.aadhaarNumber && (
                <p className="text-sm text-gray-800"><strong>Aadhaar:</strong> {selectedProperty.owner.aadhaarNumber}</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;