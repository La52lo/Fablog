const express = require("express");
const serverless = require("serverless-http");

const app = express();

// Middleware to handle JSON
app.use(express.json());

// Log when a request is received
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

// Basic test route
app.get("/", (req, res) => {
    console.log("Sending response...");
    res.send("Hello from Express on Vercel!");
});

// Export the Express app
module.exports = serverless(app);