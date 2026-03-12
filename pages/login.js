document.addEventListener('DOMContentLoaded', () => {
  updateThemeToggle();
  ensureAuthenticated();

  const form = document.getElementById('loginForm');
  const signupBtn = document.getElementById('signupBtn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando...';

    const session = await authManager.login(email, password);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Entrar';

    if (!session) {
      showNotification('Email ou senha inválidos.', 'error');
      return;
    }

    showNotification('Login efetuado com sucesso!', 'success');
    window.location.href = 'index.html';
  });

  signupBtn?.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password || password.length < 6) {
      showNotification('Informe email e senha com no mínimo 6 caracteres.', 'warning');
      return;
    }

    const result = await authManager.signUp(email, password);
    if (!result) {
      showNotification('Não foi possível criar conta.', 'error');
      return;
    }

    showNotification('Conta criada! Agora faça login.', 'success');
  });

  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
});

function updateThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (toggle) toggle.textContent = themeManager.isDarkMode() ? '☀️' : '🌙';
}

function toggleTheme() {
  themeManager.toggle();
  updateThemeToggle();
}
