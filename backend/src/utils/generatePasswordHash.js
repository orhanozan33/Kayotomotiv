// Utility script to generate password hash
// Usage: node src/utils/generatePasswordHash.js <password>

import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'admin123';

const hash = bcrypt.hashSync(password, 10);
console.log(`Password: ${password}`);
console.log(`Hash: ${hash}`);
console.log(`\nUse this hash in your database or seed file.`);


