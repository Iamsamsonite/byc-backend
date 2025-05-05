const {User, validate} = require('../models/user');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcryptjs = require('bcryptjs');
const auth = require('../middleware/auth');


// // login user
// router.post('/', async (req, res) => {
//     const { error } = validate(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     let user = await User.findOne({ emailAddress: req.body.emailAddress });
//     if (!user) return res.status(400).send('Invalid email or password.');

//     const validPassword = await bcryptjs.compare(req.body.password, user.password);
//     if (!validPassword) return res.status(400).send('Invalid email or password.');

//     const token = user.generateAuthToken();
//     res.send(token)
// });

// login user
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
  
    const user = await User.findOne({ emailAddress: req.body.emailAddress });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });
  
    const validPassword = await bcryptjs.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password.' });
  
    const token = user.generateAuthToken();
  
    // ✅ THIS IS THE CORRECT RESPONSE
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        emailAddress: user.emailAddress
      }
    });
  });
  

// // register user
// router.post('/', async (req, res) => {
//     const { error } = validate(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     let user = await User.findOne({ emailAddress: req.body.emailAddress });
//     if (user) return res.status(400).send('User already registered.');
//     user = new User({
//         name: req.body.name,
//         emailAddress: req.body.emailAddress,
//         password: req.body.password 
//     })

//     user = new User(_.pick(user, ['name', 'emailAddress', 'password']));
//     const salt = await bcryptjs.genSalt(10);
//     user.password = await bcryptjs.hash(user.password, salt);


//     user = await user.save();

//      const token = user.generateAuthToken();
//     res.header('x-auth-token', token).send(_.pick(User, ['_id', 'name', 'emailAddress']));
// });


router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
  
    let user = await User.findOne({ emailAddress: req.body.emailAddress });
    if (user) return res.status(400).send('User already registered.');
  
    user = new User({
      name: req.body.name,
      emailAddress: req.body.emailAddress,
      password: req.body.password
    });
  
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(user.password, salt);
  
    user = await user.save();
  
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send({
      token,
      user: _.pick(user, ['_id', 'name', 'emailAddress'])
    });
  });


// // get a user by id
router.get('/me', auth, async (req, res) => {
     const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});


// // route for admin login
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let admin = await admin.findOne({ emailAddress: req.body.emailAddress });
    if (!admin) return res.status(400).send('Invalid email or password.');

    const validPassword = await bcryptjs.compare(req.body.password, admin.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.');

    const token = admin.generateAuthToken();
    res.send(token)
});




    
// // route for user login
// router.post('/', async (req, res) => {
//     const { error } = validate(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     let user = await User.findOne({ emailAddress: req.body.emailAddress });
//     if (!user) return res.status(400).send('Invalid email or password.');

//     const validPassword = await bcryptjs.compare(req.body.password, user.password);
//     if (!validPassword) return res.status(400).send('Invalid email or password.');

//     const token = user.generateAuthToken();
//     res.send(token)
// });

// //  get a user by id
// router.get('/me', auth, async (req, res) => {
//      const user = await User.findById(req.user._id).select('-password');
//     res.send(user);
// });


// // route for admin login
// router.post('/', async (req, res) => {
//     const { error } = validate(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     let admin = await admin.findOne({ emailAddress: req.body.emailAddress });
//     if (!admin) return res.status(400).send('Invalid email or password.');

//     const validPassword = await bcryptjs.compare(req.body.password, admin.password);
//     if (!validPassword) return res.status(400).send('Invalid email or password.');

//     const token = admin.generateAuthToken();
//     res.send(token)
// });

 
// // route for user registration
// router.post('/', async (req, res) => {
//     const { error } = validate(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

    

//     let user = await User.findOne({ emailAddress: req.body.emailAddress });
//     if (user) return res.status(400).send('User already registered.');
//     user = new User({
//     name: req.body.name,
//     emailAddress: req.body.emailAddress,
//     password: req.body.password 
//     })


//     user = new User(_.pick(user, ['name', 'emailAddress', 'password']));
//     const salt = await bcryptjs.genSalt(10);
//     user.password = await bcryptjs.hash(user.password, salt);


//     user = await user.save();

//      const token = user.generateAuthToken();
//     res.header('x-auth-token', token).send(_.pick(User, ['_id', 'name', 'emailAddress']));
// });




 

module.exports = router;