import { MongoClient } from "mongodb";

export default function myMongoDB(
  dbName = "photofind",
  collectionName = "shotLists",
  defaultUri = "mongodb://localhost:27017",
) {
  const me = {};
  const URI = process.env.MONGODB_URI || defaultUri;

  const connect = async () => {
    const client = new MongoClient(URI);
    const shotlists = client.db(dbName).collection(collectionName);
    return { client, shotlists };
  };

  me.getShotlists = async (query = {}) => {
    const { client, shotlists } = await connect();

    try {
      const data = await shotlists.find(query).toArray();
      console.log("Fetched shotlists from MongoDB:", data.length);
      return data;
    } catch (err) {
      console.error("Error fetching shotlists from MongoDB:", err);
      throw err;
    } finally {
      await client.close();
    }
  };

  return me;
}
