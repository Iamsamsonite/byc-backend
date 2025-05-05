const Joi = require('joi');
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },

    companyName: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },

    country: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },

    city: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },

    state: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },

    
    phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },

    emailAddress: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
});

const Customer = mongoose.model('Customer', customerSchema);

function validateCustomer(customer) {   
    const schema = ({
        name: Joi.string().min(5).max(50).required(),
        companyName: Joi.string().min(5).max(50).required(),
        country: Joi.string().min(5).max(50).required(),
        city: Joi.string().min(5).max(50).required(),
        state: Joi.string().min(5).max(50).required(),
        phone: Joi.string().min(5).max(50).required(),
        emailAddress: Joi.string().min(5).max(50).required()
         
    });

    return Joi.validate(customer, schema);
}

exports.Customer = Customer;
exports.validate = validateCustomer;
exports.customerSchema = customerSchema;