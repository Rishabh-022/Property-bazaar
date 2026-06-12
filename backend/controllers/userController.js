const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const otpEmailTemplate = require('../utils/otpEmail');
const transporter = require('../config/email');

const registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, password, confirmPassword } = req.body;

        if (!fullName || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Please fill in all fields' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Check if an unverified user already exists with this email/phone
        let existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            if (!existingUser.isVerified) {
                // Delete the old unverified user so they can re-register
                await User.deleteOne({ _id: existingUser._id });
                console.log(`🗑️ Deleted old unverified account for ${email}`);
            } else {
                return res.status(400).json({ success: false, message: 'Email or phone already registered' });
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

        const user = await User.create({
            fullName,
            email,
            phone,
            password,
            isVerified: false,
            otp,
            otpExpiry
        });

        console.log(`👤 New user created: ${email} (${user._id}) with OTP: ${otp}`);

        // Send OTP email
        try {
            const info = await transporter.sendMail({
                from: `"PropertyBazzar" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Verify your email - OTP',
                html: otpEmailTemplate(fullName, otp)
            });
            console.log(`✅ OTP sent to: ${email}`);
            console.log(`📨 Message ID: ${info.messageId}`);
        } catch (emailErr) {
            console.error('❌ Failed to send OTP:', emailErr);
            return res.status(500).json({ 
                success: false, 
                message: 'Registration successful but failed to send OTP. Please try to resend OTP from the verification page.' 
            });
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email for the OTP to verify your account.',
            email: user.email   
        });
    } catch (error) {
        console.error('Register Error:', error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ success: false, message: `${field} already exists` });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
        }
        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ success: true, message: 'Email verified successfully! You can now login.' });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ success: false, message: 'Error verifying OTP' });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        try {
            const info = await transporter.sendMail({
                from: `"PropertyBazzar" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your new OTP for PropertyBazzar',
                html: otpEmailTemplate(user.fullName, otp)
            });
            console.log(`✅ OTP resent to: ${email}`);
            console.log(`📨 Message ID: ${info.messageId}`);
            res.json({ success: true, message: 'OTP resent successfully' });
        } catch (emailErr) {
            console.error('❌ Failed to resend OTP:', emailErr);
            res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
        }
    } catch (error) {
        console.error('Resend OTP Error:', error);
        res.status(500).json({ success: false, message: 'Error resending OTP' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: 'Please verify your email first. Check your inbox for OTP.' });
        }

        const isPasswordMatch = await user.matchPassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: `Welcome back, ${user.fullName}!`,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                lastLogin: user.lastLogin
            },
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                success: true,
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    aadhaarNumber: user.aadhaarNumber,
                    isVerified: user.isVerified,
                    createdAt: user.createdAt
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.fullName = req.body.fullName || user.fullName;
            user.phone = req.body.phone || user.phone;
            
            if (req.body.aadhaarNumber) {
                user.aadhaarNumber = req.body.aadhaarNumber;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: {
                    _id: updatedUser._id,
                    fullName: updatedUser.fullName,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    role: updatedUser.role,
                    aadhaarNumber: updatedUser.aadhaarNumber
                },
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Update Profile Error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'This Aadhaar number is already registered' });
        }
        
        res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    verifyOTP,
    resendOTP
};