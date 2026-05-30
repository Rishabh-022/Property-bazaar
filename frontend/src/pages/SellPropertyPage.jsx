import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SellPropertyPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [formData, setFormData] = useState({
    sellerName: user?.fullName || '',
    sellerPhone: user?.phone || '',
    aadhaarNumber: '',
    propertyType: '',
    propertySubType: '',
    registrationNumber: '',
    khataNumber: '',
    khasraNumber: '',
    surveyNumber: '',
    title: '',
    description: '',
    area: '',
    areaUnit: 'sqft',
    street: '',
    landmark: '',
    locality: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    expectedPrice: '',
    priceNegotiable: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    setImageFiles(prev => {
      const combined = [...prev, ...files];
      return combined.slice(0, 10);
    });
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 10));
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.sellerName || !formData.aadhaarNumber) {
        alert('Please fill in all required fields');
        return;
      }
      if (formData.aadhaarNumber.length !== 12) {
        alert('Aadhaar number must be 12 digits');
        return;
      }
    }
    if (step === 2) {
      if (!formData.propertyType || !formData.title || !formData.registrationNumber || !formData.khataNumber) {
        alert('Please fill in all required fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (imageFiles.length === 0) {
      alert('Please upload at least one property image');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      imageFiles.forEach((file) => {
        submitData.append('images', file);
      });

      const response = await axios.post(
        'http://localhost:5000/api/properties',
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      console.log('Property Listed:', response.data);
      alert('✅ Property listed successfully! It will appear after approval.');
      
      setFormData({
        sellerName: user?.fullName || '',
        sellerPhone: user?.phone || '',
        aadhaarNumber: '',
        propertyType: '',
        propertySubType: '',
        registrationNumber: '',
        khataNumber: '',
        khasraNumber: '',
        surveyNumber: '',
        title: '',
        description: '',
        area: '',
        areaUnit: 'sqft',
        street: '',
        landmark: '',
        locality: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        expectedPrice: '',
        priceNegotiable: false,
      });
      setImageFiles([]);
      setImagePreviews([]);
      setStep(1);

    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.message || 'Failed to list property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16" style={{
      background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)'
    }}>
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        
        {}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            List Your Property
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold font-display text-blue-950 mt-4 mb-4">
            Sell Your Property
          </h1>
          <p className="text-gray-600 text-lg">
            Fill in the details to list your property on PropertyBazzar
          </p>
        </motion.div>

        {}
        <div className="mb-10">
          <div className="flex justify-between mb-4">
            {['Seller Details', 'Property Info', 'Location & Price'].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > i + 1 ? 'bg-green-500 text-white' :
                  step === i + 1 ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`hidden sm:block text-sm font-medium ${
                  step === i + 1 ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit}>
            {}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-blue-950 mb-6">Step 1: Seller Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input type="text" name="sellerName" value={formData.sellerName} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" name="sellerPhone" value={formData.sellerPhone} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number *</label>
                  <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} required
                    placeholder="12-digit Aadhaar number" maxLength={12}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  <p className="text-xs text-gray-400 mt-1">🔒 Your Aadhaar is encrypted and secure</p>
                </div>
              </div>
            )}

            {}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-blue-950 mb-6">Step 2: Property Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
                    <select name="propertyType" value={formData.propertyType} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">Select Type</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Agricultural">Agricultural</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Plot">Plot</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sub Type</label>
                    <select name="propertySubType" value={formData.propertySubType} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">Select Sub Type</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Independent House">Independent House</option>
                      <option value="Villa">Villa</option>
                      <option value="Farm House">Farm House</option>
                      <option value="Office Space">Office Space</option>
                      <option value="Shop">Shop</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Agricultural Land">Agricultural Land</option>
                      <option value="Residential Plot">Residential Plot</option>
                      <option value="Commercial Plot">Commercial Plot</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required
                    placeholder="e.g., Beautiful 3BHK Apartment in Prime Location"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows={4}
                    placeholder="Describe your property in detail..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Area *</label>
                    <input type="number" name="area" value={formData.area} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Area Unit</label>
                    <select name="areaUnit" value={formData.areaUnit} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="sqft">Square Feet (sqft)</option>
                      <option value="sqm">Square Meter (sqm)</option>
                      <option value="sqyd">Square Yard (sqyd)</option>
                      <option value="acre">Acre</option>
                      <option value="hectare">Hectare</option>
                      <option value="bigha">Bigha</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number *</label>
                  <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Khata Number *</label>
                    <input type="text" name="khataNumber" value={formData.khataNumber} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Khasra Number</label>
                    <input type="text" name="khasraNumber" value={formData.khasraNumber} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Survey Number</label>
                  <input type="text" name="surveyNumber" value={formData.surveyNumber} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>
            )}

            {}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-blue-950 mb-6">Step 3: Location, Price & Images</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                  <input type="text" name="street" value={formData.street} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Landmark</label>
                  <input type="text" name="landmark" value={formData.landmark} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Locality *</label>
                    <input type="text" name="locality" value={formData.locality} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                    <input type="text" name="district" value={formData.district} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required maxLength={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Price (₹) *</label>
                  <input type="number" name="expectedPrice" value={formData.expectedPrice} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="priceNegotiable" checked={formData.priceNegotiable} onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Price is negotiable</span>
                </label>

                {}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Images * ({imageFiles.length}/10 selected)
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-all relative cursor-pointer bg-gray-50">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleImageChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="text-4xl mb-2 block">📸</span>
                    <p className="text-gray-600 font-medium">
                      {imageFiles.length > 0 ? 'Click to add more images' : 'Click to upload property images'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB each (max 10)</p>
                  </div>

                  {}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img src={preview} alt={`Preview ${index + 1}`} 
                            className="w-full h-24 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button type="button" onClick={prevStep}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-blue-300 transition-all">
                  ← Previous
                </button>
              ) : <div></div>}
              
              {step < 3 ? (
                <button type="button" onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                  Next Step →
                </button>
              ) : (
                <button type="submit" disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                  {loading ? 'Listing Property...' : '✅ Submit Listing'}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SellPropertyPage;