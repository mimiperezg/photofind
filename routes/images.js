import express from "express";
import { ObjectId } from "mongodb";
import imagesDB from "../db/imagesDB.js";
import { tokenize, rankImages } from "../lib/searchScore.js";

const router = express.Router();
const myDB = imagesDB();

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;
const MAX_DESCRIPTION = 500;
// resized uploads are ~100-300KB, this leaves room but keeps docs small
const MAX_DATA_URL = 1.5 * 1024 * 1024;
const MAX_URL = 2048;

// accepts ["Beach", " dog "] or "Beach, dog" -> ["beach", "dog"]
const normalizeTags = (tags) => {
  const list = Array.isArray(tags) ? tags : String(tags || "").split(",");
  const clean = list
    .map((t) => String(t).trim().toLowerCase().replace(/\s+/g, " "))
    .filter((t) => t !== "");
  return [...new Set(clean)];
};

// returns an error message, or null if the tags and description are ok
const checkDetails = (tags, description) => {
  if (tags.length > MAX_TAGS) return `At most ${MAX_TAGS} tags`;
  if (tags.some((t) => t.length > MAX_TAG_LENGTH)) {
    return `Tags must be ${MAX_TAG_LENGTH} characters or less`;
  }
  if (description.length > MAX_DESCRIPTION) {
    return `Description must be ${MAX_DESCRIPTION} characters or less`;
  }
  return null;
};

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// returns an error message, or null if src is a usable image
const checkSrc = (source, src) => {
  if (typeof src !== "string" || src === "") return "Image is required";
  if (source === "upload") {
    if (!/^data:image\/(jpeg|png|webp|gif);base64,/.test(src)) {
      return "Upload must be a base64 image";
    }
    if (src.length > MAX_DATA_URL) return "Image is too large";
    return null;
  }
  if (source === "url") {
    if (src.length > MAX_URL || !isHttpUrl(src)) {
      return "URL must start with http:// or https://";
    }
    return null;
  }
  return "Source must be upload or url";
};

// stops bad ids from turning into 500s
router.param("id", (req, res, next, id) => {
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid image id" });
  }
  next();
});

// grid of images, optionally filtered by tag
router.get("/images", async (req, res) => {
  try {
    const tag = req.query.tag ? normalizeTags([req.query.tag])[0] : undefined;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const result = await myDB.getImages({ tag, page });
    res.json(result);
  } catch (err) {
    console.error("Error fetching images:", err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

router.get("/images/tags", async (req, res) => {
  try {
    res.json(await myDB.getTags());
  } catch (err) {
    console.error("Error fetching tags:", err);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

// ranked search over tags and descriptions
router.get("/images/search", async (req, res) => {
  try {
    const terms = tokenize(req.query.q || "");
    if (terms.length === 0) {
      return res.json({ terms, results: [] });
    }

    const candidates = await myDB.searchCandidates(terms);
    const results = rankImages(candidates, terms).slice(0, 60);
    res.json({ terms, results });
  } catch (err) {
    console.error("Error searching images:", err);
    res.status(500).json({ error: "Failed to search images" });
  }
});

router.get("/images/:id", async (req, res) => {
  try {
    const image = await myDB.getImage(req.params.id);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json(image);
  } catch (err) {
    console.error("Error fetching image:", err);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

router.post("/images", async (req, res) => {
  try {
    const { source, src } = req.body;
    const tags = normalizeTags(req.body.tags);
    const description = String(req.body.description || "").trim();

    const error = checkSrc(source, src) || checkDetails(tags, description);
    if (error) {
      return res.status(400).json({ error });
    }

    const now = new Date();
    const image = {
      source,
      src,
      tags,
      description,
      createdAt: now,
      updatedAt: now,
    };
    const id = await myDB.createImage(image);
    res.status(201).json({ ...image, _id: id });
  } catch (err) {
    console.error("Error creating image:", err);
    res.status(500).json({ error: "Failed to create image" });
  }
});

// only tags and description can be edited, the picture itself stays the same
router.put("/images/:id", async (req, res) => {
  try {
    const tags = normalizeTags(req.body.tags);
    const description = String(req.body.description || "").trim();

    const error = checkDetails(tags, description);
    if (error) {
      return res.status(400).json({ error });
    }

    const updates = { tags, description, updatedAt: new Date() };
    const matched = await myDB.updateImage(req.params.id, updates);
    if (matched === 0) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json(updates);
  } catch (err) {
    console.error("Error updating image:", err);
    res.status(500).json({ error: "Failed to update image" });
  }
});

router.delete("/images/:id", async (req, res) => {
  try {
    const deleted = await myDB.deleteImage(req.params.id);
    if (deleted === 0) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

export default router;
