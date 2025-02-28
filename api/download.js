const { MongoClient } = require("mongodb");
let cachedClient = null;

module.exports = async function handler(req, res) {
    var dbName = "logbook";
	var collName = "attachments";
	if (req.method !== "GET") {
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    try {		
        if (!cachedClient) {
            cachedClient = new MongoClient(process.env.MONGO_URI);
            await cachedClient.connect();
        } 

        const db = cachedClient.db(dbName);
		const { fileId } = req.query;
		const fileDocument = await db.collection(collName).findOne({ _id: BSON.ObjectId(fileId) });

        if (!fileDocument || !fileDocument.fileData) {
            return { success: false, error: "File not found" };
        }

        // Access the binary data correctly
        const binaryData = fileDocument.fileData;

        if (!binaryData) {
            return { success: false, error: "Binary data not found in fileData field" };
        }
		const base64Data = binaryData.toBase64();

        let returnData = {
            success: true,
            fileName: fileDocument.filename,
            fileData: base64Data,  // Send base64-encoded data to the frontend
            contentType: 'application/octet-stream'  // Set the content type
        };
		
        return res.status(200).json(returnData);
    } catch (error) {
        return res.status(500).json({ error: "Failed to retrieve file: " + err.message });
    }
}
