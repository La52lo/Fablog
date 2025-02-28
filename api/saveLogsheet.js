const { MongoClient } = require("mongodb");
let cachedClient = null;

module.exports = async function handler(req, res) {
    var dbName = "logbook";
	var collName = "logsheets";
	if (req.method !== "POST") {
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    try {
        const logsheet = req.body;
        if (!logsheet) {
            return res.status(400).json({ success: false, error: "Logsheet is required" });
        }
		
		let objectId;
		if (logsheet._id) {
				objectId = new BSON.ObjectId(logsheet._id);
		}
		
        if (!cachedClient) {
            cachedClient = new MongoClient(process.env.MONGO_URI);
            await cachedClient.connect();
        } 

        const db = cachedClient.db(dbName);
		
		if (objectId) {
        
			const logsheetId = logsheet._id;
			delete logsheet._id; // Remove the _id field from the update data

			// Perform the update without modifying _id
			const updateResult = await db.collection(collName).updateOne(
				{ _id: objectId },  // Query by the original _id
				{ $set: logsheet },            // Update only the other fields  
				{ upsert: true }           // Create if doesn't exist (upsert)
			 );

				
			
		} else {
				delete logsheet._id; // This ensures MongoDB generates a new ObjectId
				const insertResult = await db.collection(collName).insertOne(logsheet);
				objectId = insertResult.insertedId;
		}
        return res.status(200).json({ success: true, objectId: objectId.toString() });
    } catch (error) {
        return res.status(500).json({ success: false, error:"Saving logsheet failed: "  + error.message });
    }
}
