import { MongoClient, ObjectId } from "mongodb";

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

  me.updateShotCaptured = async (id, index, captured) => {
    const { client, shotlists } = await connect();

    try {
      // update that one shot's captured status in the database
      const result = await shotlists.updateOne(
        { _id: new ObjectId(id) },
        { $set: { [`shots.${index}.captured`]: captured } },
      );
      console.log("Updated shot captured status:", result.modifiedCount);
      return result;
    } catch (err) {
      console.error("Error updating shot captured status:", err);
      throw err;
    } finally {
      await client.close();
    }
  };

  // create new shot list
  me.createShotlist = async (shotlist) => {
    const { client, shotlists } = await connect();

    try {
      // saves a new list
      const result = await shotlists.insertOne(shotlist);
      // mongo db gives it an _id
      return result.insertedId;
    } finally {
      await client.close();
    }
  };

  return me;
}
