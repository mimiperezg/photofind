import express from "express";
import shotlistsRouter from "./routes/shotlists.js";

console.log("initializing backend.js");

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(express.static("frontend"));

app.use("/api", shotlistsRouter);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
