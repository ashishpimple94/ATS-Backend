const mongoose = require('mongoose');
require('dotenv').config();

const ActivationKey = require('./models/ActivationKey');

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://ats:ats%4012345@clustervoter.earmcne.mongodb.net/auto_reply_db?retryWrites=true&w=majority&appName=Clustervoter';

async function createActivationKey() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Generate a random activation key
    const key = 'ATS-' + Math.random().toString(36).substring(2, 15).toUpperCase();
    
    const activationKey = new ActivationKey({
      key: key,
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    });

    await activationKey.save();
    console.log('✓ Activation key created successfully!');
    console.log('Key:', key);
    console.log('Use this key in the Flutter app to activate it.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating activation key:', error);
    process.exit(1);
  }
}

createActivationKey();
