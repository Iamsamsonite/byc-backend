// const express = require('express');
// const mongoose = require('mongoose');
// const app = express();
// const customers = require('./routes/customers');
// const categories = require('./routes/categories');
// const products = require('./routes/products');
// const blogs = require('./routes/blogs');
// const users = require('./routes/users');
// const config = require('config');
// const cors = require('cors');
// const adminMiddleware = require('./middleware/admin');
// const wishlist = require('./routes/wishlist');
// const recentview = require('./routes/recentview');
// const orderRoutes = require('./routes/order');
// const adminRoutes = require('./routes/admin');
// require('dotenv').config();

// // Check if JWT private key is set
// if (!config.get('jwtPrivateKey')) {
//     console.error('FATAL ERROR: jwtPrivateKey is not defined.');
//     console.log('jwtPrivateKey:', config.get('jwtPrivateKey')); // Move outside if
//     process.exit(1);
// }

// // MongoDB connection
// mongoose.connect('mongodb://localhost/byc')
//     .then(() => console.log('MongoDB connected...'))
//     .catch(err => console.error('Could not connect to MongoDB...', err));

// // Middleware
// app.use(express.json());
// app.use(cors());

// // API endpoints
// app.use('/api/byc/customers', customers);
// app.use('/api/byc/categories', categories);
// app.use('/api/byc/products', products);
// app.use('/api/byc/blogs', blogs);
// app.use('/api/byc/users', users);
// app.use('/api/byc/auth', users); // Use users instead of auth
// app.use('/api/byc/wishlist', wishlist);
// app.use('/api/byc/recentview', recentview);
// app.use('/api/byc/orders', orderRoutes);
// app.use('/api/byc/admin', adminMiddleware, adminRoutes);

// // Start server
// const port = process.env.PORT || 4000;
// app.listen(port, () => console.log(`CORS-enabled web server listening on port ${port}...`));

  // backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/admin');
const blogRoutes = require('./routes/blogs');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/order');
const searchRoutes = require('./routes/search');

dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/byc/auth', require('./routes/auth'));
app.use('/api/byc/products', require('./routes/products'));
app.use('/api/byc/orders', require('./routes/order'));
app.use('/api/byc/users', require('./routes/users'));
app.use('/api/byc/blogs', require('./routes/blogs'));
app.use('/api/byc/wishlist', require('./routes/wishlist'));
app.use('/api/byc/categories', require('./routes/categories'));
app.use('/api/byc/admin', adminRoutes);
app.use('/api/byc/blogs', blogRoutes);
app.use('/api/byc/users', userRoutes);
app.use('/api/byc/products', productRoutes);
app.use('/api/byc/orders', orderRoutes);
app.use('/api/byc/search', searchRoutes); // Register search route


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));