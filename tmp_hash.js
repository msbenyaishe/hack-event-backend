const bcrypt = require('bcrypt');
const password = 'admin123';
bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    console.log('HASH_START');
    console.log(hash);
    console.log('HASH_END');
});
