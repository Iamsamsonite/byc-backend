// const mongoose = require('mongoose');
// const bcryptjs = require('bcryptjs');
// const { User } = require('./models/user');

// mongoose.connect('mongodb://localhost/byc')
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => console.error('Connection failed', err));

// async function createAdmin() {
//     const email = 'oyedelesa';
//     const password = 'adminPass123'; // Change to a secure password
//     const salt = await bcryptjs.genSalt(10);
//     const hashedPassword = await bcryptjs.hash(password, salt);

//     const admin = new User({
//         name: 'Samson Admin',
//         emailAddress: email,
//         password: hashedPassword,
//         isAdmin: true
//     });

//     await admin.save();
//     console.log('Admin user created:', email);
//     mongoose.disconnect();
// }

// createAdmin();




