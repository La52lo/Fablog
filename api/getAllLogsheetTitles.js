const { MongoClient } = require("mongodb");
let cachedClient = null;


const authMiddleware = require("./auth");

module.exports = async function handler(req, res) {
    var dbName = "logbook";
	var collName = "logsheets";
	await authMiddleware(req, res);
    const userId = req.auth.sub;
	if (req.method !== "GET") {
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

	try {
        if (!cachedClient) {
            cachedClient = new MongoClient(process.env.MONGO_URI);
            await cachedClient.connect();
        } 

        const db = cachedClient.db(dbName); 
        const titles = await db.collection(collName).distinct("title");
        
        res.status(200).json({ success: true, data: titles });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}