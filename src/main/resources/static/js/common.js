let csrfToken = '';
async function getCsrf() {
  if (csrfToken) return csrfToken;
  const response = await fetch('/api/csrf', { credentials: 'same-origin' });
  const data = await response.json(); csrfToken = data.token; return csrfToken;
}
async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase(), headers = { ...(options.headers || {}) };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (!['GET', 'HEAD'].includes(method)) headers['X-XSRF-TOKEN'] = await getCsrf();
  const response = await fetch(path, { ...options, headers, credentials: 'same-origin' });
  const data = await response.json().catch(() => ({ error: 'Unexpected server response' }));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  if (path.startsWith('/api/auth/') && data.csrf) csrfToken = data.csrf;
  return data;
}
function formData(form) { return Object.fromEntries(new FormData(form).entries()); }
function message(element, text, ok = false) { if (!element) return; element.textContent = text; element.classList.toggle('ok', ok); }
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
function money(value) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value || 0)); }
function quote(value) { return Number(value) > 0 ? money(value) : 'Not quoted (legacy booking)'; }
async function requireUser(role) {
  try {
    const user = await api('/api/auth/me');
    if (role && user.role !== role) { location.href = user.role === 'ADMIN' ? '/admin.html' : '/dashboard.html'; return null; }
    document.querySelectorAll('[data-auth-page]').forEach(element => element.hidden = false);
    return user;
  } catch {
    location.href = role === 'ADMIN' ? '/admin-login.html' : '/login.html';
    return null;
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-back]').forEach(link => link.onclick = event => { event.preventDefault(); if (history.length > 1) history.back(); else location.href = '/'; });
  const menu = document.querySelector('.menu'), nav = document.querySelector('.nav');
  if (menu && nav) menu.onclick = () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', open); };
  const signIn = document.querySelector('#signIn'), logout = document.querySelector('#logout'), adminLink = document.querySelector('#adminNav');
  api('/api/auth/me').then(user => {
    if (signIn) signIn.hidden = true;
    if (logout) logout.hidden = false;
    if (adminLink && user.role === 'ADMIN') { adminLink.href = '/admin.html'; adminLink.textContent = 'Admin dashboard'; }
    const dashboardLink = document.querySelector('.nav a[href="/dashboard.html"]');
    if (dashboardLink && user.role === 'ADMIN') dashboardLink.href = '/admin.html';
  }).catch(() => { if (signIn) signIn.hidden = false; });
  if (logout) logout.onclick = async event => { event.preventDefault(); try { await api('/api/auth/logout', { method: 'POST' }); csrfToken = ''; location.href = '/'; } catch (error) { alert(error.message); } };
});