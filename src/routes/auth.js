import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, run } from '../db/index.js';
import { layout } from '../lib/layout.js';

const r = Router();

function authForm({ mode = 'login', error = '', email = '' } = {}) {
  const isLogin = mode === 'login';
  return layout(isLogin ? 'Sign In' : 'Create Account', `
    <div style="min-height:80vh;display:flex;align-items:center;justify-content:center">
      <div style="width:100%;max-width:400px;padding:0 1rem">
        <div style="text-align:center;margin-bottom:2rem">
          <div style="font-size:2rem;margin-bottom:0.5rem">✦</div>
          <h1 style="font-size:1.8rem">${isLogin ? 'Welcome back' : 'Create account'}</h1>
          <p class="muted small mt-1">${isLogin ? 'Sign in to your Lumina account' : 'Start building your knowledge base'}</p>
        </div>

        ${error ? `<div class="card mb-3" style="border-color:var(--danger)40;color:var(--danger);padding:0.8rem 1rem;font-size:0.85rem">${error}</div>` : ''}

        <form method="POST" action="/${isLogin ? 'login' : 'register'}" id="auth-form" class="card" style="padding:1.5rem">
          <div class="form-group">
            <label>Email</label>
            <input name="email" type="email" required autocomplete="email" value="${email}" placeholder="you@example.com">
          </div>
          <div class="form-group" style="position:relative">
            <label>Password</label>
            <div style="position:relative">
              <input name="password" type="password" id="pwd-input" required autocomplete="${isLogin ? 'current-password' : 'new-password'}" placeholder="••••••••" style="padding-right:2.8rem">
              <button type="button" id="pwd-toggle" onclick="togglePwd()" style="position:absolute;right:0.7rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);font-size:1rem;padding:0;width:auto">👁</button>
            </div>
            ${!isLogin ? `
            <div id="strength-bar" style="margin-top:0.5rem;height:3px;border-radius:2px;background:var(--border);overflow:hidden">
              <div id="strength-fill" style="height:100%;width:0%;transition:width 0.3s,background 0.3s;border-radius:2px"></div>
            </div>
            <div id="strength-label" class="muted small" style="margin-top:0.3rem;font-size:0.75rem"></div>
            ` : ''}
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:0.5rem">
            ${isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p class="muted small" style="text-align:center;margin-top:1rem">
          ${isLogin
            ? 'No account? <a href="/register">Create one</a>'
            : 'Already have an account? <a href="/login">Sign in</a>'}
        </p>
      </div>
    </div>

    <script>
      function togglePwd() {
        const input = document.getElementById('pwd-input');
        const btn = document.getElementById('pwd-toggle');
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = '🙈';
        } else {
          input.type = 'password';
          btn.textContent = '👁';
        }
      }

      ${!isLogin ? `
      const pwdInput = document.getElementById('pwd-input');
      const fill = document.getElementById('strength-fill');
      const label = document.getElementById('strength-label');

      pwdInput.addEventListener('input', function() {
        const v = this.value;
        let score = 0;
        if (v.length >= 8) score++;
        if (v.length >= 12) score++;
        if (/[A-Z]/.test(v)) score++;
        if (/[0-9]/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++;

        const levels = [
          { w: '0%',   c: 'transparent', t: '' },
          { w: '25%',  c: '#f87171',     t: 'Weak' },
          { w: '50%',  c: '#f4a96a',     t: 'Fair' },
          { w: '75%',  c: '#f9d96a',     t: 'Good' },
          { w: '100%', c: '#7ee8b4',     t: 'Strong' },
        ];
        const l = levels[Math.min(score, 4)];
        fill.style.width = v.length ? l.w : '0%';
        fill.style.background = l.c;
        label.textContent = v.length ? l.t : '';
      });
      ` : ''}

      // Client-side validation
      document.getElementById('auth-form').addEventListener('submit', function(e) {
        const pwd = document.getElementById('pwd-input').value;
        if (pwd.length < 6) {
          e.preventDefault();
          alert('Password must be at least 6 characters.');
        }
      });
    </script>
  `);
}

r.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.send(authForm({ mode: 'login' }));
});

r.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.send(authForm({ mode: 'register' }));
});

r.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send(authForm({ mode: 'register', error: 'Email and password are required.', email }));
  }
  if (password.length < 6) {
    return res.send(authForm({ mode: 'register', error: 'Password must be at least 6 characters.', email }));
  }

  const existing = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing.length) {
    return res.send(authForm({ mode: 'register', error: 'An account with this email already exists.', email }));
  }

  const hash = await bcrypt.hash(password, 12);
  const id = crypto.randomUUID();
  await run('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [id, email.toLowerCase(), hash]);

  req.session.userId = id;
  req.session.email = email.toLowerCase();
  req.session.save((err) => {
    if (err) console.error('Session save error:', err);
    res.redirect('/');
  });
});

r.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send(authForm({ mode: 'login', error: 'Email and password are required.', email }));
  }

  const users = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  const user = users[0];

  if (!user) {
    return res.send(authForm({ mode: 'login', error: 'Invalid email or password.', email }));
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.send(authForm({ mode: 'login', error: 'Invalid email or password.', email }));
  }

  req.session.userId = user.id;
  req.session.email = user.email;
  req.session.save((err) => {
    if (err) console.error('Session save error:', err);
    res.redirect('/');
  });
});

r.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

export default r;
