import { MongoClient, ObjectId } from "mongodb";

export default function imagesDB(
  dbName = "photofind",
  collectionName = "images",
  defaultUri = "mongodb://localhost:27017"
) {
  const me = {};
  const URI = process.env.MONGODB_URI || defaultUri;

  const connect = async () => {
    const client = new MongoClient(URI);
    const images = client.db(dbName).collection(collectionName);
    return { client, images };
  };

  // newest images first, optionally only the ones with a given tag
  me.getImages = async ({ tag, page = 1, pageSize = 24 } = {}) => {
    const { client, images } = await connect();

    try {
      const query = tag ? { tags: tag } : {};
      const [results, total] = await Promise.all([
        images
          .find(query)
          .sort({ createdAt: -1, _id: -1 })
        // might be useful to store a small thumbnail for the grid and then full image for the details page
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .toArray(),
        images.countDocuments(query),
      ]);
      return { images: results, total, page, pageSize };
    } finally {
      await client.close();
    }
  };

  // every tag in use and how many images have it, most used first
  me.getTags = async () => {
    const { client, images } = await connect();

    try {
      return await images
        .aggregate([
          { $unwind: "$tags" },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
          { $project: { _id: 0, tag: "$_id", count: 1 } },
        ])
        .toArray();
    } finally {
      await client.close();
    }
  };

  me.getImage = async (id) => {
    const { client, images } = await connect();

    try {
      return await images.findOne({ _id: new ObjectId(id) });
    } finally {
      await client.close();
    }
  };

  // images where any search term appears in a tag or the description.
  // the actual ranking happens in lib/searchScore.js
  me.searchCandidates = async (terms) => {
    const { client, images } = await connect();

    try {
      const escaped = terms.map((t) =>
        t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      );
      const pattern = new RegExp(escaped.join("|"), "i");
      return await images
        .find({ $or: [{ tags: pattern }, { description: pattern }] })
        .limit(500)
        .toArray();
    } finally {
      await client.close();
    }
  };

  me.createImage = async (image) => {
    const { client, images } = await connect();

    try {
      const result = await images.insertOne(image);
      return result.insertedId;
    } finally {
      await client.close();
    }
  };

  me.updateImage = async (id, updates) => {
    const { client, images } = await connect();

    try {
      const result = await images.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );
      return result.matchedCount;
    } finally {
      await client.close();
    }
  };

  me.deleteImage = async (id) => {
    const { client, images } = await connect();

    try {
      const result = await images.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount;
    } finally {
      await client.close();
    }
  };

  return me;
}
