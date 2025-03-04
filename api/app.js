const express = require('express');
const serverless = require('serverless-http');
const { auth, requiresAuth } = require('express-openid-connect');


const app = express();
app.use(express.json());



// Default root route
app.get('/', (req, res) => res.send('Welcome to the API'));

// Export the Express app wrapped for Vercel
module.exports = serverless(app);