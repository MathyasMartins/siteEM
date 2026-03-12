document.addEventListener('DOMContentLoaded', async () => {
  if (!ensureAuthenticated()) return;
  await loadSurpriseMessage();
  createConfetti();
  createFloatingHearts();
});

async function loadSurpriseMessage() {
  const titleEl = document.getElementById('surpriseTitle');
  const messageEl = document.getElementById('surpriseMessage');
  const imageEl = document.getElementById('surpriseImage');
  if (!titleEl || !messageEl) return;

  const params = new URLSearchParams(window.location.search);
  const surpresaId = Number(params.get('surpresa'));

  const surpresas = await supabaseApi.getSurpresas();
  const agenda = await supabaseApi.getAgenda();
  const fotos = await supabaseApi.getFotos();

  const today = DateUtils.toISODate(new Date());
  const surpresaSelecionada = surpresaId
    ? surpresas.find((item) => item.id === surpresaId)
    : surpresas.find((item) => item.data === today);

  if (surpresaSelecionada) {
    titleEl.textContent = `${surpresaSelecionada.titulo} 🎉`;
    messageEl.innerHTML = `<p>${surpresaSelecionada.mensagem}</p>`;
    const foto = fotos.find((item) => item.id === surpresaSelecionada.foto_id);
    if (foto && imageEl) {
      imageEl.src = foto.url;
      imageEl.classList.remove('hidden');
    }
    return;
  }

  const todayEvent = agenda.find((e) => DateUtils.toISODate(e.data) === today);
  if (todayEvent) {
    titleEl.textContent = `${todayEvent.titulo}! 🎉`;
    messageEl.innerHTML = `<p>${todayEvent.mensagem || 'Hoje é um dia muito especial para nós!'}</p>`;
    return;
  }

  titleEl.textContent = 'Surpresa Especial para Você! 🎁';
  messageEl.innerHTML = `<p>Você é o amor da minha vida.</p><p style="margin-top: var(--spacing-md);">Cada dia ao seu lado é uma bênção. <span class="heart-animation">💕</span></p>`;
}

function createConfetti() {
  const confettiCount = 50;
  const colors = ['#e91e63', '#ff6b9d', '#ffc0cb', '#ffffff'];
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3500);
    }, i * 30);
  }
}

function createFloatingHearts() {
  const hearts = ['❤️', '💕', '💖', '💗', '💝'];
  for (let i = 0; i < 10; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.top = Math.random() * 100 + '%';
    heart.style.animationDelay = Math.random() * 4 + 's';
    heart.style.animationDuration = (3 + Math.random() * 2) + 's';
    document.body.appendChild(heart);
  }
}
