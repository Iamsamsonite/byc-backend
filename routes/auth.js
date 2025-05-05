const {User, Admin} = require('../models/user');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcryptjs = require('bcryptjs');
const Joi = require('joi');
const decoded = require('jsonwebtoken');
 
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    

    let user = await User.findOne({ emailAddress: req.body.emailAddress });
    if (!user) return res.status(400).send('Invalid email or password.');


    const validPassword = await bcryptjs.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.');

    const token = user.generateAuthToken();
    res.send(token)



    
});

    


 
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('The user with the given ID was not found.');
    res.send(user);
});

// exports.adminAuth = async (req, res, next) => {
//     try {
//         const token = req.cookies.adminToken || req.header('x-auth-token')?.replace('Bearer ', '');
        
//         if (!token) {
//             return res.status(401).json({ message: 'Authorization required' });
//         }

//         const admin = await Admin.findById(decoded._id);
//         if (!admin) {
//             return res.status(404).json({ message: 'Admin not found' });
//         }
//         req.admin = admin;
//         req.token = token;
//         next();
//     } catch (error) {
//         res.status(400).json({ message: 'Invalid token' });
//     }
// }


function validate(req) {
    const schema = {
    emailAddress: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
    };
    return Joi.validate(req, schema);
    }
    

module.exports = router;