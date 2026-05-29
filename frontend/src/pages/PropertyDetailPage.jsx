import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { FaWhatsapp, FaFacebook, FaTwitter, FaLink, FaShareAlt } from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import FavoriteButton from '../components/FavoriteButton';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
};

const PropertyMap = ({ address }) => {
  const [center, setCenter] = useState(null);
  const [error, setError] = useState('');

  const fullAddress = `${address?.street || ''}, ${address?.locality || ''}, ${address?.city || ''}, ${address?.state || ''}, ${address?.pincode || ''}`;

  useEffect(() => {
    if (!fullAddress.trim()) return;

    const geocode = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
        );
        const data = await response.json();
        if (data.status === 'OK') {
          const { lat, lng } = data.results[0].geometry.location;
          setCenter({ lat, lng });
        } else {
          setError('Could not find this address on the map.');
        }
      } catch (err) {
        setError('Failed to load map location.');
      }
    };

    geocode();
  }, [fullAddress]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!center) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl h-[300px] flex items-center justify-center text-gray-400 dark:text-gray-500">
        Loading map…
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  useEffect(() => {
    if (property?._id) {
      fetchReviews();
    }
  }, [property]);

  const fetchPropertyDetails = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/properties/${id}`);
      setProperty(data.property);
    } catch (err) {
      console.error('Failed to fetch property:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/properties/${property._id}/reviews`);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) {
      setReviewError('Please select a rating');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write a comment');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/properties/${property._id}/reviews`,
        { rating: reviewRating, comment: reviewComment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReviews(prev => [data.review, ...prev]);
      setReviewRating(0);
      setReviewComment('');
      setReviewSuccess('Review submitted successfully!');
      fetchPropertyDetails();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Crore`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} Lakhs`;
    return `₹${price.toLocaleString()}`;
  };

  const handleChatWithSeller = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await axios.post('http://localhost:5000/api/chat/conversations', {
        propertyId: property._id,
        receiverId: property.owner?._id
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      navigate('/chat');
    } catch (err) {
      console.error('Failed to start conversation:', err);
      alert('Failed to start chat. Please try again.');
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = property
    ? `Check out this property: ${property.title} - ${formatPrice(property.pricing?.expectedPrice)} in ${property.address?.city}`
    : '';

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🏚️</span>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Property Not Found</h2>
          <Link to="/properties" className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block">
            ← Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link to="/properties" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
            ← Back to Properties
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              
              <div className="relative h-96 bg-gradient-to-br from-blue-500 to-blue-700">
                {property.images && property.images.length > 0 ? (
                  <img src={property.images[selectedImage]?.url} alt={property.title}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-8xl">🏠</span>
                  </div>
                )}
                
                <div className="absolute top-4 right-4">
                  {property.status === 'Active' && (
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      ✅ Verified & Active
                    </span>
                  )}
                </div>
              </div>

              {property.images && property.images.length > 1 && (
                <div className="p-4 flex gap-3 overflow-x-auto">
                  {property.images.map((img, index) => (
                    <button key={index} onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-blue-600 shadow-lg' : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                      }`}>
                      <img src={img.url} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FavoriteButton propertyId={property._id} size="text-3xl" />
                    <h1 className="text-3xl font-bold text-blue-950 dark:text-blue-200">{property.title}</h1>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    📍 {property.address?.street}, {property.address?.locality}, {property.address?.city}, {property.address?.state} - {property.address?.pincode}
                  </p>
                </div>
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold">
                  {property.propertyType}
                </span>
              </div>

              <div className="flex gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(property.pricing?.expectedPrice)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{property.dimensions?.area}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{property.dimensions?.areaUnit}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{property.views || 0}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Views</div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-blue-950 dark:text-blue-200 mb-4">Description</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">{property.description}</p>

              <h2 className="text-xl font-bold text-blue-950 dark:text-blue-200 mb-4">Document Verification</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
                    <span>✅</span> Aadhaar Verified
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">{property.aadhaarNumber}</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                    <span>📋</span> Registration
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">{property.registrationNumber}</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-semibold">
                    <span>📄</span> Khata Number
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">{property.khataNumber}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-semibold">
                    <span>🏷️</span> Khasra Number
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">{property.khasraNumber || 'N/A'}</div>
                </div>
              </div>

              <div className="mt-8 border-t dark:border-gray-700 pt-8">
                <h2 className="text-xl font-bold text-blue-950 dark:text-blue-200 mb-6 flex items-center gap-2">
                  Reviews & Ratings
                  {property.averageRating > 0 && (
                    <span className="text-base font-normal text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <StarRating rating={property.averageRating || 0} interactive={false} size="text-lg" />
                      <span>({property.numReviews} reviews)</span>
                    </span>
                  )}
                </h2>

                {user && user._id !== property.owner?._id && (
                  <form onSubmit={handleSubmitReview} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4">Write a Review</h3>
                    {reviewError && <p className="text-red-600 dark:text-red-400 text-sm mb-3">{reviewError}</p>}
                    {reviewSuccess && <p className="text-green-600 dark:text-green-400 text-sm mb-3">{reviewSuccess}</p>}
                    
                    <div className="mb-4">
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Your Rating</label>
                      <StarRating rating={reviewRating} onRate={setReviewRating} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Your Comment</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                        placeholder="Share your experience with this property..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {reviews.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                              {review.user?.fullName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-200">{review.user?.fullName || 'Unknown'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                  year: 'numeric', month: 'short', day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <StarRating rating={review.rating} interactive={false} size="text-lg" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-blue-950 dark:text-blue-200 mb-4">Seller Information</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {property.sellerName?.charAt(0) || 'S'}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{property.sellerName}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{property.owner?.email || 'N/A'}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                📞 {property.sellerPhone}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-blue-950 dark:text-blue-200 mb-4">Property Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Property Type</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{property.propertyType}</span>
                </div>
                {property.propertySubType && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Sub Type</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{property.propertySubType}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Area</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{property.dimensions?.area} {property.dimensions?.areaUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`font-semibold ${
                    property.status === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {property.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Rating</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <StarRating rating={property.averageRating || 0} interactive={false} size="text-sm" />
                    {property.numReviews > 0 && <span className="text-xs text-gray-500 dark:text-gray-400">({property.numReviews})</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Listed On</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {new Date(property.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-blue-950 dark:text-blue-200">📍 Location</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {property.address?.locality}, {property.address?.city}
                </p>
              </div>
              <PropertyMap address={property.address} />
            </div>

            {user && property.owner?._id !== user._id && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleChatWithSeller}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
              >
                💬 Chat with Seller
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              📞 Contact Seller
            </motion.button>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-blue-950 dark:text-blue-200 mb-4 flex items-center gap-2">
                <FaShareAlt className="text-blue-600 dark:text-blue-400" /> Share This Property
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleNativeShare}
                  className="py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <FaLink /> {navigator.share ? 'Share' : 'Copy Link'}
                </button>
                <button
                  onClick={shareWhatsApp}
                  className="py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaWhatsapp size={18} /> WhatsApp
                </button>
                <button
                  onClick={shareFacebook}
                  className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaFacebook size={18} /> Facebook
                </button>
                <button
                  onClick={shareTwitter}
                  className="py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaTwitter size={18} /> Twitter
                </button>
              </div>
            </div>

            {property.pricing?.priceNegotiable && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                <span className="text-green-700 dark:text-green-400 font-semibold">💰 Price is Negotiable!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;