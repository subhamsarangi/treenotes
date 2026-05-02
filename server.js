import express from "express";
import session from "express-session";
import { getDb } from "./src/db/index.js";
import { requireAuth } from "./src/lib/auth.js";
import authRouter from "./src/routes/auth.js";
import homeRouter from "./src/routes/home.js";
import nichesRouter from "./src/routes/niches.js";
import nichePageRouter from "./src/routes/niche-page.js";
import importRouter from "./src/routes/import.js";
import answerRouter from "./src/routes/answer.js";
import linkRouter from "./src/routes/link.js";
import promptsRouter from "./src/routes/prompts.js";
import accountRouter from "./src/routes/account.js";

const app = express();
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'lumina-dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

await getDb();

// Public routes
app.use(authRouter);

// Protected routes
app.use(requireAuth, homeRouter);
app.use(requireAuth, nichesRouter);
app.use(requireAuth, nichePageRouter);
app.use(requireAuth, importRouter);
app.use(requireAuth, answerRouter);
app.use(requireAuth, linkRouter);
app.use(requireAuth, promptsRouter);
app.use(requireAuth, accountRouter);

// Export for Vercel
export default app;

// Listen locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3003;
  app.listen(PORT, () =>
    console.log(`Lumina running at http://localhost:${PORT}`)
  );
}
