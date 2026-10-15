import express from "express";

console.log("initializing backend.js");

const port = process.env.PORT || 3000;

const app = express();

app.use(express.static("frontend"));

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
