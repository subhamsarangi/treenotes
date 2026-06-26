const STEPS_MODERN_SOLUTION_HISTORICAL_PERSON = [
  {
    label: "#1 Profiling",
    model: "high",
    thinking: "high",
    prompt: `Profile both subjects as they actually exist.

For [Modern Problem]: Describe the problem as it is experienced today at the ground level — not policy language, but lived reality. What does it cost people? Who does it hurt most? What solutions have already been tried and why have they fallen short? Identify 5–7 specific dimensions or failure points of the problem.

For [Person from History]: Profile them strictly from documented sources — their writings, speeches, recorded actions, and contemporaneous accounts. Identify their core ideas, their analytical frameworks, the kinds of problems they were trying to solve, and the tools or mental models they habitually reached for. Do not extrapolate beyond what is documented. Note the historical context they operated in — what constraints, technologies, and social structures shaped their thinking.

Structural constraints: Before proceeding, explicitly identify where the historical figure's world and the modern problem's world are so different that direct application is physically or conceptually implausible — different scales, technologies, social structures, or material realities. These are fixed parameters, not negotiable friction. Every subsequent step must treat them as walls.`,
  },
  {
    label: "#2 Brainstorming",
    model: "med",
    thinking: "low",
    prompt: `Act as an intellectual historian and applied philosopher.

Using the profiles from Step 1, generate a comprehensive list of every possible way [Person from History]'s documented ideas, frameworks, and methods could be applied to [Modern Problem].

Stay strictly within what is documented — do not invent positions they never held. But do follow their logic: if their documented framework leads to a clear implication for the modern problem, include it.

For every point, cite the specific text, speech, action, or documented behavior from [Person from History] that it draws from. Cast wide. List everything, including partial fits and indirect connections.`,
  },
  {
    label: "#3 Filtering",
    model: "low",
    thinking: "low",
    prompt: `Review the full list from Step 2.

Remove points that require positions the historical figure never documented, that collapse under the structural constraints identified in Step 1, or that are too vague to be actionable. Remove duplicates and keep only the more specific version of overlapping points.

What remains should be a clean set of distinct, grounded connections — each one traceable to a real documented source.`,
  },
  {
    label: "#4 Contradiction Check",
    model: "high",
    thinking: "high",
    prompt: `Review the filtered list from Step 3 against modern evidence and knowledge.

Flag only major contradictions — cases where [Person from History]'s documented idea is not just outdated but actively conflicts with something we now know to be true, or where applying it to [Modern Problem] would clearly make things worse.

For each flagged contradiction: name the idea, name the specific modern evidence or reality that contradicts it, and note whether the contradiction is fatal to the point or whether the underlying logic still holds even if the surface application doesn't.

Do not flag minor anachronisms or things that are simply incomplete by modern standards — only flag what genuinely breaks.`,
  },
  {
    label: "#5 Clustering",
    model: "low",
    thinking: "low",
    prompt: `Group the surviving points from Steps 3 and 4 into 3 to 5 thematic categories.

Each category should represent a coherent mode of thinking or type of intervention — for example: how [Person from History] diagnosed root causes, how they thought about human incentives, how they approached institutional design, how they handled resistance or opposition.

Give each category a clear title and one sentence describing what unifies it. Note which points within each category carry a contradiction flag from Step 4.`,
  },
  {
    label: "#6 Prioritizing",
    model: "high",
    thinking: "high",
    prompt: `Evaluate and rank all categories from Step 5 using two criteria:

1. Relevance — How directly does this category address the most critical failure points of [Modern Problem] identified in Step 1?

2. Applicability — How cleanly can the historical figure's documented thinking translate across the gap in time, technology, and social context? Where does the structural constraint wall from Step 1 limit this?

Rank categories from highest to lowest overall value. Be honest: flag where the connection is intellectually interesting but practically thin, and where contradiction flags from Step 4 significantly weaken a category's usefulness.`,
  },
  {
    label: "#7 Distilling",
    model: "med",
    thinking: "low",
    prompt: `Compress all categories from Step 5 into a definitive master list of the most critical, specific, and usable insights.

For each point:
- State the insight clearly and concisely
- Cite the specific documented source from [Person from History] it draws from
- Name the specific dimension of [Modern Problem] from Step 1 it addresses
- Note any contradiction flag from Step 4 and whether it weakens or complicates the point
- Note its visual or comedic potential — is there a striking image, a surprising juxtaposition, or an absurd contrast between their world and ours that could anchor it on screen?`,
  },
  {
    label: "#8 Writing",
    model: "max",
    thinking: "low",
    prompt: `Using the distilled points from Step 7 and the profiles from Step 1, write a full narration script for a YouTube video essay titled "What [Modern Problem] Would Look Like If [Person from History] Were Alive Today" — or a variant title that feels more discovered than assembled.

Format:
- Narration written to be spoken aloud — not read. Short sentences. Rhythm matters.
- Inline visual/B-roll directions in [brackets] after each segment they apply to — what's on screen, what archival image or modern footage plays, what text appears
- Structure: a cold open hook (30–60 seconds) that creates immediate intrigue before the title card; one section per category from Step 5, ordered by Step 6 ranking; a closing section that honestly addresses where the historical figure's thinking runs out — what they couldn't have seen, what problem they would have failed to solve

Voice:
- Written for YouTube — intelligent but not academic, curious but not preachy
- Tone: the energy of someone genuinely interesting at a dinner party, not a lecturer
- Think: Conan O'Brien's dry observational wit meets IShowSpeed's unfiltered enthusiasm — but neither is being performed. The humor comes from the juxtaposition itself being surprising or absurd, not from jokes
- No bullet points in the narration. No "In conclusion." No thesis statements delivered like thesis statements.

Anchoring rules:
- Every insight must be traceable to a specific documented source from [Person from History]
- Every insight must connect explicitly to a named failure point of [Modern Problem]
- Contradiction flags from Step 4 must appear in the script — not buried, not dismissed, addressed directly in the voice of the piece
- The script should feel like it was discovered, not assembled`,
  },
];

const PLACEHOLDERS_MODERN_SOLUTION_HISTORICAL_PERSON = {
  "Modern Problem": ["Affordable Housing", "Climate Change", "Income Inequality", "Healthcare Access", "Cybersecurity", "Public Transit", "Artificial Intelligence Regulation"],
  "Person from History": ["Karl Marx", "Adam Smith", "Niccolò Machiavelli", "Socrates", "John Locke", "Thomas Hobbes", "Jean-Jacques Rousseau"]
};
