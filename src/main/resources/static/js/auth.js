document.addEventListener('DOMContentLoaded', () => {
  const login = document.querySelector('#loginForm');
  if (login) login.onsubmit = async event => {
    event.preventDefault(); const status = login.querySelector('.message'), button = login.querySelector('button');
    button.disabled = true; button.textContent = 'Signing in…';
    try { const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(formData(login)) }); location.href = result.redirect; }
    catch (error) { message(status, error.message); }
    finally { button.disabled = false; button.textContent = 'Sign in'; }
  };
  const adminLogin = document.querySelector('#adminLoginForm');
  if (adminLogin) {
    api('/api/auth/me').then(user => { if (user.role === 'ADMIN') location.href = '/admin.html'; }).catch(() => {});
    adminLogin.onsubmit = async event => {
      event.preventDefault(); const status = adminLogin.querySelector('.message'), button = adminLogin.querySelector('button');
      button.disabled = true; button.textContent = 'Checking access…';
      try { const result = await api('/api/auth/admin-login', { method: 'POST', body: JSON.stringify(formData(adminLogin)) }); location.href = result.redirect; }
      catch (error) { message(status, error.message); }
      finally { button.disabled = false; button.textContent = 'Sign in to dashboard'; }
    };
  }
  const signup = document.querySelector('#signupForm');
  if (signup) signup.onsubmit = async event => {
    event.preventDefault(); const status = signup.querySelector('.message'), values = formData(signup);
    if (values.password !== values.confirm) { message(status, 'Passwords do not match.'); return; }
    delete values.confirm;
    try { await api('/api/auth/signup', { method: 'POST', body: JSON.stringify(values) }); message(status, 'Account created. Redirecting to sign in…', true); setTimeout(() => location.href = '/login.html', 900); }
    catch (error) { message(status, error.message); }
  };
});