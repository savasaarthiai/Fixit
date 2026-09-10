require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('✅ Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }

        const admin = new User({
            name: 'Admin',
            email: 'admin@fixit.edu',
            password: process.env.ADMIN_PASSWORD || 'admin123',
            role: 'admin',
            department: 'Maintenance'
        });

        await admin.save();
        console.log('✅ Admin user created successfully');
        console.log('   Email: admin@fixit.edu');
        console.log('   Password:', process.env.ADMIN_PASSWORD || 'admin123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

seedAdmin();
