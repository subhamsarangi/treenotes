const STEPS_INTRA_COUNTRY_LEARNING = [
  {
    label: "#1 Country Profiling",
    model: "high",
    thinking: "high",
    prompt: `Profile both countries as they exist today at the level of everyday society.

For [Country X]: Identify its 5–7 most significant social, cultural, civic, or structural challenges as experienced by ordinary people in daily life — not official government narratives, but lived reality.

For [Country Y]: Identify the domains where its society — not its government — demonstrably excels compared to global or regional peers. Focus on what its people do, how they behave collectively, and what cultural or civic norms make it distinctive.

These two profiles will serve as the analytical lens for all subsequent steps.

Structural constraints of [Country X]: Before proceeding, explicitly identify the hard realities that will limit transferability of lessons — population size and density, urban/rural split, climate and geography, economic development tier, infrastructure baseline, and any other structural factors that make certain solutions physically or economically implausible regardless of cultural will. These constraints are not excuses — they are parameters. Every subsequent step must treat them as fixed walls, not negotiable friction.`,
  },
  {
    label: "#2 Brainstorming",
    model: "med",
    thinking: "low",
    prompt: `Act as a comparative sociologist and cultural analyst examining what [Country X] can learn from [Country Y].

Using the country profiles established in Step 0, generate a comprehensive, uninhibited list of all possible lessons, mechanisms, behaviors, and practices that people in [Country X] could draw from [Country Y].

Ground your brainstorm in what people do — civic habits, social trust, community organization, cultural attitudes toward work, family, public space, strangers, and institutions, grassroots movements, informal norms, collective behaviors — not what governments legislate or mandate.

For every point you list, name a real, specific example, movement, statistic, or cultural norm from [Country Y] that illustrates it. Do not self-censor. List everything.`,
  },
  {
    label: "#3 Filtering",
    model: "low",
    thinking: "low",
    prompt: `Review the full list generated in Step 2.

Remove exact duplicates, overlapping concepts, vague generalizations, and low-value fluff. If two points say essentially the same thing at different levels of abstraction, keep only the more specific and grounded one.

What remains should be a clean set of distinct, high-signal points, each tied to a concrete reality in either [Country X] or [Country Y].`,
  },
  {
    label: "#4 Clustering",
    model: "low",
    thinking: "low",
    prompt: `Group the filtered points from Step 3 into 3 to 5 logical, high-level categories or conceptual themes.

Each category should represent a coherent domain of social life — for example: civic culture, relationship with public space, attitudes toward collective responsibility, community-level organization, or intergenerational behavior.

Give each category a clear, distinct title and write one sentence describing what unifies the points within it.`,
  },
  {
    label: "#5 Prioritizing",
    model: "high",
    thinking: "high",
    prompt: `Evaluate and rank all categories from Step 4 using two criteria:

1. Transferability — How realistically can people in [Country X] adopt or adapt this, given its cultural, economic, historical, and structural realities? What are the friction points?

2. Impact — How significantly would this address the most pressing gaps in [Country X] identified in Step 1?

Rank the categories from highest to lowest overall value. For each category, provide a brief, honest assessment on both criteria — including where transferability is low, where cultural resistance is likely, and where the gap between the two countries is so large that the lesson risks being aspirational rather than actionable.

Transferability must account for the structural constraints identified in Step 1 — a lesson that requires infrastructure, density, or climate conditions Country X doesn't have should be ranked low or discarded entirely, not softened with "with some adaptation."`,
  },
  {
    label: "#6 Distilling",
    model: "med",
    thinking: "low",
    prompt: `Compress all categories from Step 4 — not just the top-ranked — into a definitive master list of the most critical, specific, and actionable lessons.

For each point:
- State the lesson clearly and concisely
- Name the specific mechanism or behavior from [Country Y] that it draws from
- Identify the most immediate implementation risk or cultural obstacle for [Country X]

No vague prescriptions. Every point must be grounded and specific.

Also note, for each point, its visual or comedic potential — is there a striking image, a surprising statistic, or an absurd contrast that could anchor it on screen?`,
  },
  {
    label: "#7 Writing",
    model: "max",
    thinking: "low",
    prompt: `Using the distilled points from Step 6 and the country profiles from Step 1, write a full narration script for a YouTube video essay titled "What [Country X] Can Learn from [Country Y]."

Format:
- Narration written to be spoken aloud — not read. Short sentences. Rhythm matters.
- Inline visual/B-roll directions in [brackets] after each segment they apply to, specifying what should be on screen.
- Structure: a cold open hook (30–60 seconds) that creates immediate intrigue before the title card; one section per major theme from Step 4, ordered by Step 5 ranking; a closing section that's honest about friction without being defeatist

Voice:
- Written for YouTube — intelligent but not academic, curious but not preachy
- Tone: the energy of someone genuinely interesting at a dinner party, not a lecturer
- Think: Conan O'Brien's dry observational wit meets Youtuber John Green — but neither is being performed. Just interesting insights with a touch of dry humor.
- No bullet points in the narration. No "In conclusion." No thesis statements delivered like thesis statements.

Anchoring rules (same as before, now applied to script form):
- Every lesson must cite a specific named example, norm, movement, or stat from [Country Y]
- Every lesson must connect to a named real challenge in [Country X]
- The script should feel like it was discovered, not assembled.`,
  },
];

const PLACEHOLDERS_INTRA_COUNTRY_LEARNING = {
  "Country X": [
    "France",
    "Japan",
    "Brazil",
    "India",
    "Canada",
    "Australia",
    "United Kingdom",
  ],
  "Country Y": [
    "Norway",
    "Singapore",
    "Switzerland",
    "New Zealand",
    "Germany",
    "Denmark",
    "Finland",
  ],
};
