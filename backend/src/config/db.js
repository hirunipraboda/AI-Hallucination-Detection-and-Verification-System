const { MongoClient } = require('mongodb');
require('dotenv').config();

// Configure DNS resolution to use Google's Public DNS to prevent SRV ETIMEOUTs
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let dbConnection;

const connectDB = async () => {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB server');
        dbConnection = client.db('defaultDB');
        return dbConnection;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const getDB = () => {
    if (!dbConnection) {
        throw new Error('Database not connected!');
    }
    return dbConnection;
};

module.exports = { connectDB, getDB, client };
