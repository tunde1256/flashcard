const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'My API',
        version: '1.0.0',
        description: 'A simple API documentation'
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 3000}/api`,
            description: 'API server'
        }
    ]
};

// Swagger options
const options = {
    swaggerDefinition,
    apis: ['./routes/*.js', './controllers/*.js'] // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
