require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Profile = require('../models/Profile');

const updateContacts = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vip_portfolio';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Database connected.');

    // 1. Update Admin User emails
    const userUpdate = await User.updateMany(
      { username: 'admin' },
      { $set: { email: 'sunny824118@gmail.com' } }
    );
    console.log(`Updated ${userUpdate.modifiedCount} user records.`);

    // 2. Update Profile email and phone
    const profileUpdate = await Profile.updateMany(
      {},
      { 
        $set: { 
          email: 'sunny824118@gmail.com',
          phone: '+91 9117461058'
        } 
      }
    );
    console.log(`Updated ${profileUpdate.modifiedCount} profile records.`);

    // Check updated records
    const updatedUser = await User.findOne({ username: 'admin' });
    const updatedProfile = await Profile.findOne();
    
    console.log('\n--- VERIFICATION ---');
    console.log(`Admin User Email: ${updatedUser ? updatedUser.email : 'NOT FOUND'}`);
    console.log(`Profile Name: ${updatedProfile ? updatedProfile.name : 'NOT FOUND'}`);
    console.log(`Profile Email: ${updatedProfile ? updatedProfile.email : 'NOT FOUND'}`);
    console.log(`Profile Phone: ${updatedProfile ? updatedProfile.phone : 'NOT FOUND'}`);
    console.log('---------------------\n');

    console.log('Contact details successfully updated in MongoDB!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

updateContacts();
