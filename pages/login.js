const errorMessage = document.getElementById('errorMessage');
const submitBtn = document.getElementById('submitBtn');

// Se já estiver logado, redireciona
window.addEventListener('DOMContentLoaded', async () => {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    window.location.href = './index.html';
  }
});

submitBtn.addEventListener('click', async () => {
  errorMessage.textContent = '';

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    errorMessage.textContent = 'Preencha todos os campos.';
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    errorMessage.textContent = 'Usuário ou senha inválidos.';
  } else {
    window.location.href = './index.html';
  }
});
// Botão de alternar tema
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    themeManager.toggle();
  });
}