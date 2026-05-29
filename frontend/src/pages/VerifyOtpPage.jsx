import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const VerifyOtpPage = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!email) navigate('/register');
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('OTP must be 6 digits');
            return;
        }
        setLoading(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/users/verify-otp', { email, otp });
            setSuccess(data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await axios.post('http://localhost:5000/api/users/resend-otp', { email });
            alert('OTP resent to your email');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-blue-950 dark:text-blue-200 mb-2">Verify Your Email</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Enter the 6‑digit OTP sent to <strong>{email}</strong></p>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                {success && <p className="text-green-500 text-sm mb-3">{success}</p>}
                <form onSubmit={handleVerify}>
                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-center text-2xl tracking-widest bg-white dark:bg-gray-700 dark:text-white mb-4"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>
                <button onClick={handleResend} className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Resend OTP
                </button>
            </motion.div>
        </div>
    );
};

export default VerifyOtpPage;