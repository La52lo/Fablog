const { MongoClient } = require("mongodb");
let cachedClient = null;

module.exports = async function handler(req, res) {
    var dbName = "logbook";
	var collName = "templates";
	if (req.method !== "POST") {
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    try {
        const template = req.body;
        if (!template) {
            return res.status(400).json({ success: false, error: "Template is required" });
        }
		
        if (!cachedClient) {
            cachedClient = new MongoClient(process.env.MONGO_URI);
            await cachedClient.connect();
        } 

        const db = cachedClient.db(dbName);
		const insertResult = await db.collection(collName).insertOne(template)
		
        return res.status(200).json({ success: true, objectId: insertResult.title });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, error: "Template title already exists. Choose a different title." });
        }

        return res.status(500).json({ success: false, error: error.message });
    }
}
