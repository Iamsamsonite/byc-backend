 // C:/Users/HP/Desktop/desktop/bycbackend/check.js
const bcryptjs = require('bcryptjs');

async function checkPassword() {
  const storedHash = '$2b$10$P.1JEOhaRKmO3mvV18wfneKw13qCISBm/U8ClNINWSlArnGGVLNxy';
  const password = 'oyedelesamson';
  const isValid = await bcryptjs.compare(password, storedHash);
  console.log('Password valid:', isValid);
}

checkPassword();