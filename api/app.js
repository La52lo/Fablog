const express = require('express');
const serverless = require('serverless-http');
const { auth, requiresAuth } = require('express-openid-connect');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configure Auth0 options
const config = {
  authRequired: false, 
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL,           
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
};

// Initialize the Auth0 middleware
app.use(auth(config));

// Public Route
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Logsheet Manager</h1>');
});

const apiEndpoints = ["getAllLogsheetTitles","getLogsheetByTitle",
			"getTemplateByTitle","deleteLogsheetById",
			"deleteTemplateById","download","upload",
			"saveLogsheet","saveTemplate"]

// Other routes (like your logsheet API endpoints) can be added here
apiEndpoints.forEach(endpoint => {
    app.get(`/{endpoint}`,  requiresAuth(), (req, res) => {
  res.json(req.oidc.user);
});





// Export the Express app wrapped in serverless-http so that Vercel can handle it as a function
module.exports = serverless(app);
