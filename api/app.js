const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    console.log("Sending response...");
    res.status(200).send("Hello from Express without serverless-http!");
});

// Export the Express app as a normal function
module.exports = (req, res) => {
    app(req, res);
};
