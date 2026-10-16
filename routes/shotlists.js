import express from "express";
import MyMongoDB from "../db/MyMongoDB.js";

const router = express.Router();
const myDB = MyMongoDB();

router.get("/shotlists", async (req, res) => {
  try {
    const shotlists = await myDB.getShotlists();
    res.json(shotlists);
  } catch (err) {
    console.error("Error fetching shotlists:", err);
    res.status(500).json({ error: "Failed to fetch shotlists" });
  }
});

export default router;
