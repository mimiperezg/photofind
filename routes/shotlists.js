import express from "express";

const router = express.Router();

router.get("/shotlists", (req, res) => {
  res.send("Hello from the shotlists route!");
});

export default router;
