

/*
const jwt = require("jsonwebtoken");
module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ success: false, error: "Unauthorized: Missing token" });
            return false;  // ⛔ Explicitly return false
        }
		//console.log(token,"@@@",process.env.AUTH0_CLIENT_SECRET,"****");
		//console.log("Token parts:", token.split(".").length);
        const decoded = jwt.verify(token, process.env.AUTH0_CLIENT_SECRET, { algorithms: ["RS256"] });
        req.auth = decoded; // Attach user data to request
        next(); // ✅ Continue to API function
    } catch (error) {
        console.error("Authentication error:", error.message);
        res.status(401).json({ success: false, error: "Unauthorized: Invalid token" });
        return false;  // ⛔ Explicitly return false
    }
};
*/



const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
    jwksUri: `https://dev-16kzyoiz8sa3k8ht.us.auth0.com/.well-known/jwks.json`
});

async function getSigningKey(header) {
    return new Promise((resolve, reject) => {
        client.getSigningKey(header.kid, (err, key) => {
            if (err) reject(err);
            resolve(key.publicKey || key.rsaPublicKey);
        });
    });
}

module.exports = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token)  {
            res.status(401).json({ success: false, error: "Unauthorized: Missing token" });
            return false;  // ⛔ Explicitly return false
        }

        const decodedHeader = jwt.decode(token, { complete: true });
        if (!decodedHeader) throw new Error("Invalid Token");

        const key = await getSigningKey(decodedHeader.header);
        const decoded = jwt.verify(token, key, { algorithms: ["RS256"] });
		req.auth = decoded; // Attach user data to request
        return true;

        //res.status(200).json({ success: true, user: decoded });
    } catch (error) {
        console.error("Auth error:", error.message);
        res.status(401).json({ success: false, error: "Unauthorized: Invalid token" });
		return false;  // ⛔ Explicitly return false
    }
};
