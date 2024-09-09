const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
const connection = mongoose.connect(process.env.DB_URI, {
    maxPoolSize: 10, // Maximum number of connections in the pool
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds trying to connect to the database
    socketTimeoutMS: 45000, // Timeout after 45 seconds of inactivity
    connectTimeoutMS: 10000, // Initial connection timeout (10 seconds)
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    
    // Optionally, retry connection logic can be implemented here if needed
    setTimeout(() => {
      mongoose.connect(process.env.DB_URI); // Retry connection after a delay
    }, 5000); // Retry after 5 seconds
  });

module.exports = connection;
