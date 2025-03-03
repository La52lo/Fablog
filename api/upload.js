const { MongoClient } = require("mongodb");
let cachedClient = null;

module.exports = async function handler(req, res) {
    var dbName = "logbook";
	var collName = "attachments";
	if (req.method !== "POST") {
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
	
    try {		
        const { fileName, fileData } = req.body;

        if (!fileName || !fileData) {
            return res.status(400).json({ success: false, error: "Missing file data or filename." });
        }
		
		//const {base64Data, fileName} = req.body;
		//const binaryData = BSON.Binary.fromBase64(base64Data);
		//const base64String = fileData.split(",")[1];
		const base64String = fileData.includes(",") ? fileData.split(",")[1] : fileData;

        // Convert Base64 to Binary
        const binaryData = Buffer.from(base64String, "base64");
		if (!cachedClient) {
            cachedClient = new MongoClient(process.env.MONGO_URI);
            await cachedClient.connect();
        } 
		const {Binary} = require('mongodb');
        const db = cachedClient.db(dbName);
		const fileDocument = {
            filename: fileName,
            fileData: new Binary(binaryData),  // Store the binary data directly
            uploadDate: new Date()
        };

        const insertResult = await db.collection(collName).insertOne(fileDocument);
		
        return res.status(200).json({success: true, fileId: insertResult.insertedId.toString() });
    } catch (error) {
        return res.status(500).json({ error: "Failed to upload file: " + error.message });
    }
}
