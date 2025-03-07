/*
    auth0Client = await auth0.createAuth0Client({
        domain: "dev-16kzyoiz8sa3k8ht.us.auth0.com",
		clientId: "qd9Sjyu0GDTqs3Kj9oLqxUP5zLdz2096",
 
*/
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) throw new Error("Unauthorized");

        const decoded = jwt.verify(token, process.env.AUTH0_SECRET, { algorithms: ["RS256"] });
        req.auth = decoded;
    } catch (error) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
};
