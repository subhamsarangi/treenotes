import express from "express";
import { getDb } from "./src/db/index.js";
import homeRouter from "./src/routes/home.js";
import nichesRouter from "./src/routes/niches.js";
import nichePageRouter from "./src/routes/niche-page.js";
import importRouter from "./src/routes/import.js";
import answerRouter from "./src/routes/answer.js";
import linkRouter from "./src/routes/link.js";

const app = express();
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.json());

await getDb();

app.use(homeRouter);
app.use(nichesRouter);
app.use(nichePageRouter);
app.use(importRouter);
app.use(answerRouter);
app.use(linkRouter);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () =>
  console.log(`Lumina running at http://localhost:${PORT}`),
);
