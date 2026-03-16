const bcrypt = require('bcrypt');

const password = 'admin123'; // CHANGE THIS to your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("\n--- COPY THE CODE BELOW ---");
    console.log(`UPDATE admins SET password_hash = '${hash}' WHERE login = 'admin';`);
    console.log("---------------------------\n");
    console.log(`Now you can log in with password: ${password}`);
});
