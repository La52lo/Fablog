import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {
    var dbName = "logbook";
	var collName = "attachments";
	if (req.method !== "POST") {
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
	
    try {		
        const {base64Data, fileName} = req.body;
		const binaryData = BSON.Binary.fromBase64(base64Data);
		if (!cachedClient) {
            cachedClient = new MongoClient(process.env.MONGO_URI);
            await cachedClient.connect();
        } 

        const db = cachedClient.db(dbName);
		const fileDocument = {
            filename: fileName,
            fileData: binaryData,  // Store the binary data directly
            uploadDate: new Date()
        };

        const insertResult = await db.collection(collName).insertOne(fileDocument);
		
        return res.status(200).json({success: true, fileId: insertResult.insertedId.toString() });
    } catch (error) {
        return res.status(500).json({ error: "Failed to upload file: " + err.message });
    }
}
