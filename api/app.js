const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.write("Hello from Express on Vercel!");
    res.end(); // Ensures response is properly closed
});

// Export the Express app as a normal function
module.exports = (req, res) => {
    app(req, res);
};
