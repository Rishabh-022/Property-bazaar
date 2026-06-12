import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyOtpPage from './pages/VerifyOtpPage'  
import ProtectedRoute from './components/ProtectedRoute'
import BuyPropertyPage from './pages/BuyPropertyPage'
import SellPropertyPage from './pages/SellPropertyPage'
import AdminDashboard from './pages/AdminDashboard'
import PropertyDetailPage from './pages/PropertyDetailPage'
import ProfilePage from './pages/ProfilePage'
import ChatPage from './pages/ChatPage'
import AboutPage from './pages/AboutPage'       // 👈 NEW
import SupportChatbot from './components/SupportChatbot'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/about" element={<AboutPage />} />   {/* 👈 NEW */}
        
        {/* Property Detail - Public */}
        <Route path="/property/:id" element={<PropertyDetailPage />} />

        {/* Protected Routes - Require Login */}
        <Route 
          path="/properties" 
          element={
            <ProtectedRoute>
              <BuyPropertyPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sell" 
          element={
            <ProtectedRoute>
              <SellPropertyPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile Route */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* Chat Route */}
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Footer />
      <SupportChatbot />
    </div>
  )
}

export default App