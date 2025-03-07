const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ success: false, error: "Unauthorized: Missing token" });
            return; // ⛔ STOP further execution
        }

        const decoded = jwt.verify(token, process.env.AUTH0_SECRET, { algorithms: ["RS256"] });
        req.auth = decoded; // Attach user data to request
        next(); // ✅ Continue to API function
    } catch (error) {
        console.error("Authentication error:", error.message);
        res.status(401).json({ success: false, error: "Unauthorized: Invalid token" });
        return; // ⛔ STOP execution after sending response
    }
};
