const { MongoClient } = require("mongodb");
let cachedClient = null;

module.exports = async function handler(req, res) {
    var dbName = "logbook";
	var collName = "logsheets";
	if (req.method !== "GET") {
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

	try {
        const { title } = req.query;
        if (!title) {
            return res.status(400).json({ success: false, error: "Title is required" });
        }

        if (!cachedClient) {
            cachedClient = new MongoClient(process.env.MONGO_URI);
            await cachedClient.connect();
        } 

        const db = cachedClient.db(dbName); 
        const logsheet = await db.collection(collName).findOne({ title: title });
        
        res.status(200).json({ success: true, data: logsheet });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}