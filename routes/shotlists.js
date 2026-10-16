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

router.patch("/shotlists/:id/shots/:index", async (req, res) => {
  try {
    const { id, index } = req.params;
    const { captured } = req.body;

    const updated = await myDB.updateShotCaptured(id, index, captured);
    if (!updated) {
      return res.status(404).json({ error: "Shot not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Error updating shot captured status:", err);
    res.status(500).json({ error: "Failed to update shot captured status" });
  }
});

// creating new shotlist route
router.post("/shotlists", async (req, res) => {
  try {
    // the new shot list that the form sends
    const newShotlist = req.body;
    if (!newShotlist.name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const id = await myDB.createShotlist(newShotlist);
    res.status(201).json({ ...newShotlist, _id: id });
  } catch (err) {
    console.error("error creating shotlist", err);
    res.status(500).json({ error: "failed to create shotlist" });
  }
});

export default router;
