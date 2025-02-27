import { MongoClient } from "mongodb";

export default async function handler(req, res) {
    var dbName = "logbook";
	var collName = "logsheets";
	try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        const db = client.db(dbName); // Replace with your database name
		const collection = db.collection(collName);
        const titles = await collection.distinct("title");
        
        res.status(200).json({ success: true, data: titles });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}