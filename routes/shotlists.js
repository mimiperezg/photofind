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

    // a name with only spaces would pass this check, use name.trim() before checking
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

// delete shotlist
router.delete("/shotlists/:id", async (req, res) => {
  try {
    const deleted = await myDB.deleteShotlist(req.params.id);

    if (deleted === 0) {
      return res.status(404).json({ error: "shot list not found " });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("error deleting shotlist:", err);
    res.status(500).json({ error: "failed to delete shotlist" });
  }
});

router.put("/shotlists/:id", async (req, res) => {
  try {
    const { name, location, startDate, endDate } = req.body;
    // make sure name is there
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // I think it would be nice to reject any end dates that are before the start date
    // If the edit form doesn't send a field then its being saved as empty so only update fields that were sent
    const matched = await myDB.editShotlist(req.params.id, {
      name,
      location,
      startDate,
      endDate,
    });

    if (matched === 0) {
      return res.status(404).json({ error: "Shot list not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Error updating shotlist:", err);
    res.status(500).json({ error: "Failed to update shotlist" });
  }
});

export default router;
