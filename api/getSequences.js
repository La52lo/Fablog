import { MongoClient } from "mongodb";

export default async function handler(req, res) {
    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        const db = client.db("your_db"); // Replace with your database name
        const sequences = await db.collection("sequences").find().toArray();
        
        res.status(200).json({ success: true, data: sequences });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
