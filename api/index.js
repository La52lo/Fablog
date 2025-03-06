const express = require("express");
const serverless = require("serverless-http");

const app = express();
app.use(express.json());

// Test route to verify deployment
app.get("/", (req, res) => {
	try{
		console.log("Sending JSON response...");
		res.json({ message: "Hello from Express on Vercel!" });
	}catch(error){
		res.json({ message: error.message });
	}	

});

// Export the Express app correctly
module.exports = serverless(app);
console.log("finished export");