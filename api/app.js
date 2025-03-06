const express = require("express");
const serverless = require("serverless-http");

const app = express();
app.use(express.json());

// Test route to verify deployment
app.get("/", (req, res) => {
    console.log("Received request: GET /");
    res.send("Hello from Express on Vercel!");
});

// Export the Express app correctly
module.exports = serverless(app);
