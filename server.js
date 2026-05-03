import express from "express";
import session from "express-session";
import { getDb } from "./src/db/index.js";
import { requireAuth } from "./src/lib/auth.js";
import { TursoSessionStore } from "./src/lib/turso-session-store.js";
import authRouter from "./src/routes/auth.js";
import homeRouter from "./src/routes/home.js";
import nichesRouter from "./src/routes/niches.js";
import nichePageRouter from "./src/routes/niche-page.js";
import importRouter from "./src/routes/import.js";
import answerRouter from "./src/routes/answer.js";
import linkRouter from "./src/routes/link.js";
import promptsRouter from "./src/routes/prompts.js";
import accountRouter from "./src/routes/account.js";
import graphRouter from "./src/routes/graph.js";

const app = express();
app.use('/assets', express.static('assets'));
app.get('/sw.js', (req, res) => res.sendFile('assets/sw.js', { root: '.' }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.json());

const db = await getDb();

app.use(session({
  store: new TursoSessionStore(db),
  secret: process.env.SESSION_SECRET || 'lumina-dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Public routes
app.use(authRouter);

// Home handles its own auth (shows landing to guests, dashboard to users)
app.use(homeRouter);

// Protected routes
app.use(requireAuth, nichesRouter);
app.use(requireAuth, nichePageRouter);
app.use(requireAuth, importRouter);
app.use(requireAuth, answerRouter);
app.use(requireAuth, linkRouter);
app.use(requireAuth, promptsRouter);
app.use(requireAuth, accountRouter);
app.use(requireAuth, graphRouter);

// Export for Vercel
export default app;

// Listen locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3003;
  app.listen(PORT, () =>
    console.log(`Lumina running at http://localhost:${PORT}`)
  );
}
