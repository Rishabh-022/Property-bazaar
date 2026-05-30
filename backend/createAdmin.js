const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await User.deleteMany({ role: 'admin' });
        console.log('Removed old admin accounts');

        const admin = await User.create({
            fullName: 'Admin User',
            email: 'admin@propertybazzar.com',
            phone: '9999999999',  
            password: 'Admin@123',
            role: 'admin',
            isVerified: true
        });

        console.log('✅ Admin created successfully!');
        console.log('Email: admin@propertybazzar.com');
        console.log('Password: Admin@123');
        console.log('Phone: 9999999999');
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

createAdmin();