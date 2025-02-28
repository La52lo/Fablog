import { MongoClient } from "mongodb";
let cachedClient = null;

export default async function handler(req, res) {
    var dbName = "logbook";
	var collName = "templates";
	if (req.method !== "GET") {
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

	try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, error: "Title is required" });
        }

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