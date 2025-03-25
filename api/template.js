const { MongoClient} = require("mongodb");
let cachedClient = null;
const authMiddleware = require("./auth");

module.exports = async function handler(req, res) {
    var dbName = "logbook";
	var collName = "templates";
	const userId = await authMiddleware(req, res);
    if (!userId)
        return; // ⛔ Stop execution if unauthorized
    try {
		
		if (!cachedClient) {
                cachedClient = new MongoClient(process.env.MONGO_URI);
                await cachedClient.connect();
        }
		const db = cachedClient.db(dbName);
		if (req.method == "GET") {
			
			const { title } = req.query;
			if (!title) {
				return res.status(400).json({ success: false, error: "Title is required" });
			}
			const db = cachedClient.db(dbName); 
			const template = await db.collection(collName).findOne({ 
				title: title,
				ownerId: userId
			});
			
			res.status(200).json({ success: true, data: template });
		}
		if (req.method == "POST") {
			const template = req.body;
			if (!template) {
				return res.status(400).json({ success: false, error: "Template is required" });
			}
			const insertResult = await db.collection(collName).insertOne({
				...template,           // ✅ Spread existing fields
				_id: new ObjectId(),   // ✅ Ensure unique ID
				ownerId: userId        // ✅ Securely assign ownership
			});
			return res.status(200).json({ success: true, objectId: insertResult.title });
		}
		if (req.method == "DELETE") {
			const { title } = req.query;
			if (!title) {
				return res.status(400).json({ success: false, error: "Title is required" });
			}
			const result = await db.collection(collName).deleteOne({ title: title,ownerId: userId });

			if (result.deletedCount === 1) {
				return res.status(200).json({ success: true, message: `Template '${title}' deleted.` });
			} else {
				return res.status(404).json({ success: false, error: `Template '${title}' not found.` });
			}
		}
		
		
    } catch (error) {
		if (error.code === 11000) {
            return res.status(409).json({ success: false, error: "Template title already exists. Choose a different title." });
        }
        res.status(500).json({ success: false, error: error.message });
    }
}





