import "./loadEnv.js";
import express from "express";
import shotlistsRouter from "./routes/shotlists.js";
import imagesRouter from "./routes/images.js";

console.log("initializing backend.js");

const port = process.env.PORT || 3000;

const app = express();

// raised from the 100kb default so resized image uploads fit
app.use(express.json({ limit: "2mb" }));
app.use(express.static("frontend"));

app.use("/api", shotlistsRouter);
app.use("/api", imagesRouter);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
