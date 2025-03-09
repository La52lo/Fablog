const { MongoClient } = require("mongodb");
let cachedClient = null;
const authMiddleware = require("./auth");

module.exports = async function handler(req, res) {
    var dbName = "logbook";
	var collName = "logsheets";
	const userId = await authMiddleware(req, res);
    if (!userId) return;  // ⛔ Stop execution if unauthorized
	if (req.method !== "POST") {
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    try {
        const logsheet = req.body;
        if (!logsheet) {
            return res.status(400).json({ success: false, error: "Logsheet is required" });
        }
		const {ObjectId} = require('mongodb');
		const objectId = logsheet._id ? new ObjectId(logsheet._id) : new ObjectId();
		if (!objectId) { objectId = new ObjectId();}
        if (!cachedClient) {
            cachedClient = new MongoClient(process.env.MONGO_URI);
            await cachedClient.connect();
        } 

        const db = cachedClient.db(dbName);
		const logsheetId = logsheet._id;
		delete logsheet._id; // Remove the _id field from the update data

		// Perform the update without modifying _id
		const updateResult = await db.collection(collName).updateOne(
			{ _id: objectId, ownerId: userId },  // ✅ Filter ensures user can only update their own record
			{ $set: logsheet, $setOnInsert: { ownerId: userId } },  // ✅ If inserting, set ownerId
			{ upsert: true }  // ✅ Insert if no matching document is found
		);
        return res.status(200).json({ success: true, objectId: objectId.toString() });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, error: "Logsheet title already exists. Choose a different title." });
        }

        return res.status(500).json({ success: false, error: error.message });
    }
}
