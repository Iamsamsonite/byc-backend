const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    

    emailAddress: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },

    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },

    
});

adminSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
    }
    next();
});

adminSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('admin', adminSchema);

 


