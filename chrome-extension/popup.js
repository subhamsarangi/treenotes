const PROMPTS = {
  convert: `Convert the last generated answer in this conversation into a valid structured JSON. Return only the JSON in a single code block start to end, no explanation, no markdown fences.

Schema:
- title: string (infer from the content)
- niche: string (short slug like "machine-learning" or "philosophy")
- created_at: today's date as YYYY-MM-DD
- summary: one sentence, max 15 words
- content: array of blocks. Available block types:
    { "type": "text", "value": "..." }
    { "type": "heading", "level": 2, "value": "..." }
    { "type": "code", "lang": "...", "value": "..." }
    { "type": "callout", "variant": "tip|info|warning|danger", "value": "..." }
    { "type": "list", "ordered": true|false, "items": ["..."] }
    { "type": "table", "headers": ["..."], "rows": [["..."]] }
    { "type": "divider" }`,

  fresh: `Answer the following question in a valid structured JSON. Return only the JSON in a single code block start to end, no explanation, no markdown fences.

Schema:
- title: string
- niche: string (short slug like "machine-learning" or "philosophy")
- created_at: today's date as YYYY-MM-DD
- summary: one sentence, max 15 words
- content: array of blocks. Available block types:
    { "type": "text", "value": "..." }
    { "type": "heading", "level": 2, "value": "..." }
    { "type": "code", "lang": "...", "value": "..." }
    { "type": "callout", "variant": "tip|info|warning|danger", "value": "..." }
    { "type": "list", "ordered": true|false, "items": ["..."] }
    { "type": "table", "headers": ["..."], "rows": [["..."]] }
    { "type": "divider" }

Question: [YOUR QUESTION HERE]`,

  manual: `Convert the following text into a valid structured JSON. Return only the JSON in a single code block start to end, no explanation, no markdown fences.

Schema:
- title: string (infer from the content)
- niche: string (short slug like "machine-learning" or "philosophy")
- created_at: today's date as YYYY-MM-DD
- summary: one sentence, max 15 words
- content: array of blocks. Available block types:
    { "type": "text", "value": "..." }
    { "type": "heading", "level": 2, "value": "..." }
    { "type": "code", "lang": "...", "value": "..." }
    { "type": "callout", "variant": "tip|info|warning|danger", "value": "..." }
    { "type": "list", "ordered": true|false, "items": ["..."] }
    { "type": "table", "headers": ["..."], "rows": [["..."]] }
    { "type": "divider" }

Text:
[PASTE TEXT HERE]`
};

const SUPPORTED = [
  'chatgpt.com',
  'chat.openai.com',
  'gemini.google.com',
  'claude.ai'
];

function setStatus(msg, type = '') {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = type;
}

async function handleAction(type) {
  const prompt = PROMPTS[type];
  const shouldSubmit = !prompt.includes('['); // Don't submit if there are placeholders

  setStatus('Injecting…');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  const supported = SUPPORTED.some(s => url.includes(s));

  if (!supported) {
    setStatus('Not supported. Open ChatGPT, Gemini, or Claude.', 'err');
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectPrompt,
      args: [prompt, url, shouldSubmit]
    });
    setStatus(shouldSubmit ? 'Prompt injected and submitted!' : 'Prompt injected! Fill details and send.', 'ok');
  } catch (e) {
    setStatus('Failed: ' + e.message, 'err');
  }
}

document.getElementById('btn-convert-last').addEventListener('click', () => handleAction('convert'));
document.getElementById('btn-fresh').addEventListener('click', () => handleAction('fresh'));
document.getElementById('btn-manual').addEventListener('click', () => handleAction('manual'));

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const type = e.currentTarget.getAttribute('data-type');
    const prompt = PROMPTS[type];
    try {
      await navigator.clipboard.writeText(prompt);
      const original = e.currentTarget.textContent;
      e.currentTarget.textContent = '✅';
      setStatus('Copied to clipboard!', 'ok');
      setTimeout(() => {
        e.currentTarget.textContent = original;
      }, 1500);
    } catch {
      setStatus('Failed to copy', 'err');
    }
  });
});

function injectPrompt(prompt, url, shouldSubmit) {
  // Common function to simulate typing and optionally click send
  const typeAndSend = (editorSelector, sendSelector) => {
    const editor = document.querySelector(editorSelector);
    if (!editor) throw new Error('Input not found');
    
    editor.focus();
    document.execCommand('insertText', false, prompt);
    editor.dispatchEvent(new InputEvent('input', { bubbles: true }));

    if (shouldSubmit) {
      setTimeout(() => {
        const send = document.querySelector(sendSelector);
        if (send && !send.disabled) send.click();
      }, 300);
    }
  };

  // ChatGPT
  if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) {
    typeAndSend(
      '#prompt-textarea, [data-id="root"] div[contenteditable="true"], div[contenteditable="true"][data-testid]',
      '[data-testid="send-button"], button[aria-label="Send prompt"]'
    );
    return;
  }

  // Claude
  if (url.includes('claude.ai')) {
    typeAndSend(
      'div[contenteditable="true"].ProseMirror, div[contenteditable="true"]',
      'button[aria-label="Send Message"], button[type="submit"]'
    );
    return;
  }

  // Gemini
  if (url.includes('gemini.google.com')) {
    const editor = document.querySelector('rich-textarea div[contenteditable="true"], div[contenteditable="true"]');
    if (!editor) throw new Error('Input not found');
    
    editor.focus();
    document.execCommand('insertText', false, prompt);
    editor.dispatchEvent(new InputEvent('input', { bubbles: true }));

    if (shouldSubmit) {
      setTimeout(() => {
        const send = document.querySelector('button[aria-label="Send message"], button.send-button, mat-icon[data-mat-icon-name="send"]')?.closest('button');
        if (send && !send.disabled) send.click();
      }, 300);
    }
    return;
  }
}
