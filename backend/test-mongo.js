require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
// Mask password in log
console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':****@'));

mongoose.connect(uri)
    .then(() => {
        console.log('Successfully connected to MongoDB!');
        console.log('Connection ready state:', mongoose.connection.readyState);
        console.log('Database name:', mongoose.connection.name);
        return mongoose.disconnect();
    })
    .catch(err => {
        console.error('Connection failed:', err.message);
        process.exit(1);
    });