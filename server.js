require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { swaggerUi, swaggerSpec } = require('./swagger'); // Import Swagger

const app = express();
const port = process.env.PORT || 3000;

const Db = require('./db/db');
const UserRoute = require('./routes/userRouter');

const AdminRoute = require('./routes/AdminRouter');

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(morgan('combined'));

// Use CORS middleware
app.use(cors());

// Route handlers
app.use('/api/admin', AdminRoute);
app.use('/api/user', UserRoute);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
