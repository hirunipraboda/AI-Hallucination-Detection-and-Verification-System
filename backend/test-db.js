const mongoose = require('mongoose');
require('dotenv').config();

const Explanation = require('./models/Explanation');
const User = require('./models/User');

console.log('Testing models load...');
console.log('Explanation model keys:', Object.keys(Explanation.schema.paths));
console.log('User model keys:', Object.keys(User.schema.paths));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
