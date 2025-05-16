 // C:/Users/HP/Desktop/desktop/bycbackend/hash.js
const bcryptjs = require('bcryptjs');

async function hashPassword() {
  const password = 'oyedelesamson'; // Change to 'adminPass123' for better security
  const salt = await bcryptjs.genSalt(10);
  const hashed = await bcryptjs.hash(password, salt);
  console.log('New hashed password:', hashed);
}

hashPassword();