const express = require('express');
const mongoose = require('mongoose');
const app = express();
const customers = require('./routes/customers');
const categories = require('./routes/categories');
const products = require('./routes/products');
const blogs = require('./routes/blogs');
const users = require('./routes/users');
const auth = require('./routes/auth');
const config = require('config');
const cors = require('cors');
const admin = require('./middleware/admin');
 




if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
    }
    

mongoose.connect('mongodb://localhost/byc')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));


    // middleware
app.use(express.json());
app.use(cors());

// api endpoints
app.use('/api/byc/customers', customers);
app.use('/api/byc/categories', categories);
app.use('/api/byc/products', products);
app.use('/api/byc/blogs', blogs);
app.use('/api/byc/users', users, );
app.use('/api/byc/auth', auth);


 

   
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`CORS-enabled web server listening on port ${port}...`));
