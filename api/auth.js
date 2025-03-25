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
            return "Guest"; 
        }

        const decodedHeader = jwt.decode(token, { complete: true });
        if (!decodedHeader) throw new Error("Invalid Token");

        const key = await getSigningKey(decodedHeader.header);
        const decoded = jwt.verify(token, key, { algorithms: ["RS256"] });
		if (decoded.exp * 1000 < Date.now()) {
            return "Guest";
        }
		req.auth = decoded; // Attach user data to request
        return decoded.sub;  // ✅ Return user_id
    } catch (error) {
        console.error("Auth error:", error.message);
		return "Guest";
    }
};
