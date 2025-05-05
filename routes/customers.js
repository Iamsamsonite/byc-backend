const express = require('express');
const router = express.Router();
const { Customer, validate } = require('../models/customer');

// GET /api/customers
router.get('/', async (req, res) => {
    const customers = await Customer.find().sort('name');
    res.send(customers);
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    res.send(customer);
});

// POST /api/customers
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let customer = new Customer({
        name: req.body.name,
        companyName: req.body.companyName,
        country: req.body.country,
        city: req.body.city,
        state: req.body.state,
        phone: req.body.phone,
        emailAddress: req.body.emailAddress
    });

    customer = await customer.save();
    res.send(customer);
}
);

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        companyName: req.body.companyName,
        country: req.body.country,
        city: req.body.city,
        state: req.body.state,
        phone: req.body.phone,
        emailAddress: req.body.emailAddress
    }, { new: true });

    
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    res.send(customer);
});

// // DELETE /api/customers/:id    
// router.delete('/:id', async (req, res) => {
//     const customer = await Customer.findByIdAndDelete(req.params.id);

//     if (!customer) return res.status(404).send('The customer with the given ID was not found.');

//     res.send(customer);
// });

module.exports = router;