import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {
    var dbName = "logbook";
	var collName = "logsheets";
	if (req.method !== "DELETE") {
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
        const result = await db.collection(collName).deleteOne({ title: title });

        if (result.deletedCount === 1) {
            return res.status(200).json({ success: true, message: `Template '${title}' deleted.` });
        } else {
            return res.status(404).json({ success: false, error: "Logsheet not found." });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
