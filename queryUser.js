 // C:/Users/HP/Desktop/desktop/bycbackend/queryUser.js
const mongoose = require('mongoose');

async function queryUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/byc-ecommerce');
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      emailAddress: String,
      password: String,
      isAdmin: Boolean,
      createdAt: Date
    }));

    // Test exact match
    const userByEmail = await User.findOne({ emailAddress: 'Samson@gmail.com' });
    console.log('Exact email query:', userByEmail ? userByEmail : 'No user found');

    // Test case-insensitive
    const userByRegex = await User.findOne({ 
      emailAddress: { $regex: '^Samson@gmail.com$', $options: 'i' }
    });
    console.log('Regex email query:', userByRegex ? userByRegex : 'No user found');

    // Test by ID
    const userById = await User.findOne({ 
      _id: new mongoose.Types.ObjectId('68238561fe4a46bec7c427e8')
    });
    console.log('ID query:', userById ? userById : 'No user found');

    // List all users
    const allUsers = await User.find().select('emailAddress');
    console.log('All users in DB:', allUsers);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

queryUser();