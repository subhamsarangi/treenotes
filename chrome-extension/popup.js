const PROMPT = `Convert the last generated answer in this conversation into a valid structured JSON. Return only the JSON in a single code block start to end, no explanation, no markdown fences.

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
    { "type": "divider" }`;

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

document.getElementById('inject-btn').addEventListener('click', async () => {
  const btn = document.getElementById('inject-btn');
  btn.disabled = true;
  setStatus('Injecting…');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  const supported = SUPPORTED.some(s => url.includes(s));

  if (!supported) {
    setStatus('Not supported. Open ChatGPT, Gemini, or Claude.', 'err');
    btn.disabled = false;
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectPrompt,
      args: [PROMPT, url]
    });
    setStatus('Prompt injected and submitted!', 'ok');
  } catch (e) {
    setStatus('Failed: ' + e.message, 'err');
  }

  btn.disabled = false;
});

function injectPrompt(prompt, url) {
  // ChatGPT
  if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) {
    const editor = document.querySelector('#prompt-textarea, [data-id="root"] div[contenteditable="true"], div[contenteditable="true"][data-testid]');
    if (!editor) throw new Error('Input not found');
    editor.focus();
    document.execCommand('insertText', false, prompt);
    editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
    setTimeout(() => {
      const send = document.querySelector('[data-testid="send-button"], button[aria-label="Send prompt"]');
      if (send && !send.disabled) send.click();
    }, 300);
    return;
  }

  // Claude
  if (url.includes('claude.ai')) {
    const editor = document.querySelector('div[contenteditable="true"].ProseMirror, div[contenteditable="true"]');
    if (!editor) throw new Error('Input not found');
    editor.focus();
    document.execCommand('insertText', false, prompt);
    editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
    setTimeout(() => {
      const send = document.querySelector('button[aria-label="Send Message"], button[type="submit"]');
      if (send && !send.disabled) send.click();
    }, 300);
    return;
  }

  // Gemini
  if (url.includes('gemini.google.com')) {
    const editor = document.querySelector('rich-textarea div[contenteditable="true"], div[contenteditable="true"]');
    if (!editor) throw new Error('Input not found');
    editor.focus();
    document.execCommand('insertText', false, prompt);
    editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
    setTimeout(() => {
      const send = document.querySelector('button[aria-label="Send message"], button.send-button, mat-icon[data-mat-icon-name="send"]')?.closest('button');
      if (send && !send.disabled) send.click();
    }, 300);
    return;
  }
}
