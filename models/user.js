const joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
 



const userSchema = new mongoose.Schema({
    name: {
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

    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },

    isAdmin:{   
        type: Boolean,
    
    }

     
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, 
    config.get('jwtPrivateKey'));
    return token;
    }
    


const User = mongoose.model('User', userSchema);
    function validateUser(user) {
    const schema = ({
        name: joi.string().min(5).max(50).required(),
        emailAddress: joi.string().min(5).max(50).required().email(),
        password: joi.string().min(5).max(1024).required(),
        
    });
    return joi.validate(user, schema);

   
}

function validateUser(user) {
    const schema = ({
      name: joi.string().min(5).max(50).required(),
      emailAddress: joi.string().min(5).max(50).required().email(),
      password: joi.string().min(5).max(1024).required(),
    });
    return joi.validate(user, schema);
  }




 

exports.User = User;
exports.validate = validateUser;


// const joi = require('joi');
// const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const config = require('config');

// // Define user schema
// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         minlength: 5,
//         maxlength: 50
//     },

//     emailAddress: {
//         type: String,
//         required: true,
//         minlength: 5,
//         maxlength: 50
//     },

//     password: {
//         type: String,
//         required: true,
//         minlength: 5,
//         maxlength: 1024
//     },

//     isAdmin: {   
//         type: Boolean,
//         default: false // Assuming you want to default this to `false` for regular users
//     }
// });

// // Method to generate an auth token for the user
// userSchema.methods.generateAuthToken = function() {
//     const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, 
//     config.get('jwtPrivateKey'));
//     return token;
// }

// // Create User model
// const User = mongoose.model('User', userSchema);

// // Function to validate user data using Joi
// function validateUser(user) {
//     const schema = joi.object({
//         name: joi.string().min(5).max(50).required(),
//         emailAddress: joi.string().min(5).max(50).required().email(),
//         password: joi.string().min(5).max(1024).required(),
//     });
//     return schema.validate(user);
// }

// // Exporting the User model and validateUser function
// exports.User = User;
// exports.validate = validateUser;
