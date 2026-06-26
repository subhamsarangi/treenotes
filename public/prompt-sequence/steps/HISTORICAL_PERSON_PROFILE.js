const STEPS_HISTORICAL_PERSON_PROFILE = [
  {
    label: "#1 Brainstorming",
    model: "med",
    thinking: "low",
    prompt: `You are going to be given a name from history. Before producing any structured answer, brainstorm freely and without inhibition everything you know about [Person].

Cast wide. Include their actions, beliefs, relationships, decisions, contradictions, context, the world they operated in, who benefited from them, who suffered because of them, how they were perceived in their own time, and how that perception has shifted.

Do not self-censor. Do not organize. Do not filter for relevance yet. Surface everything — the celebrated, the damning, the ambiguous, and the overlooked.

Show the raw brainstorm output as-is. No formatting requirements.

The person is [Person].`,
  },
  {
    label: "#2 Filtering",
    model: "low",
    thinking: "low",
    prompt: `Review the brainstorm output from Step 1.

Remove the following:
- Blatant factual inaccuracies or things that cannot be substantiated
- Vague generalizations that carry no specific content
- Pure repetition or near-identical points
- Anything so tangential it adds no signal to understanding this person

What remains should be a clean, high-signal set of facts, tensions, and observations — specific, grounded, and ready to be analyzed. Keep contradictions and ambiguities intact; do not resolve them prematurely.`,
  },
  {
    label: "#3 Answering",
    model: "high",
    thinking: "high",
    prompt: `Using the filtered output from Step 2, produce an expert-level answer to the following 5 questions about [Person], analyzed strictly from a center-left viewpoint — one that values human rights, social equity, democratic accountability, and evidence-based reasoning, and is skeptical of concentrated power whether state or corporate.

Answer each question in turn, clearly labeled:

1. Good, bad, or mixed? — Give a clear verdict, then justify it with the most important evidence from Step 2. Do not hedge into meaninglessness. If mixed, say exactly what tips the balance and in which direction.

2. Major positive contributions — What did they add to the world that meaningfully improved human welfare, expanded rights, or advanced knowledge or justice? Be specific. Name the thing, name who it helped, name the scale.

3. Major negative contributions — What did they do or enable that caused harm, entrenched injustice, or set back human welfare? Be specific. Name the thing, name who it hurt, name the scale. Do not soften with context unless the context genuinely changes the moral weight.

4. Most active decade(s) — Identify the one or two decades when their impact — positive or negative — was at its peak. Give a one-sentence explanation of why that window matters.

5. How they are remembered vs. how they should be remembered — From a center-left viewpoint, where does the popular or mainstream historical record get this person wrong? Are they over-celebrated, under-credited, unfairly vilified, or conveniently simplified? What is the most important thing the standard narrative leaves out?

Every answer must be grounded in specific named facts, events, or documented behaviors from Step 2. No vague verdicts. No floating moral claims without evidence.`,
  },
];

const PLACEHOLDERS_HISTORICAL_PERSON_PROFILE = {
  "Person": ["Socrates", "Napoleon Bonaparte", "Cleopatra", "Mahatma Gandhi", "Abraham Lincoln", "Marie Curie", "Albert Einstein"]
};
