const express = require('express');
const serverless = require('serverless-http');
const { auth, requiresAuth } = require('express-openid-connect');


const app = express();
app.use(express.json());

// Configure Auth0 options
const config = {
  authRequired: false, 
  auth0Logout: true,
  secret: process.env.AUTH0_CLIENT_SECRET,
  baseURL: process.env.BASE_URL,           
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

// Initialize the Auth0 middleware
app.use(auth(config));

// Public Route

const apiEndpoints = ["getAllLogsheetTitles","getLogsheetByTitle",
			"getTemplateByTitle","deleteLogsheetById",
			"deleteTemplateById","download","upload",
			"saveLogsheet","saveTemplate"];

apiEndpoints.forEach(endpoint => {
    app.get(`/{endpoint}`,requiresAuth(),(req, res) => {res.json(req.oidc.user);});
});

// Default root route
app.get('/', (req, res) => res.send('Welcome to the API'));

// Export the Express app wrapped for Vercel
module.exports.handler = serverless(app);