// ============================================================================
// PÁGINA DE SURPRESA - surpresa.html
// ============================================================================
// Lógica para exibir mensagens românticas com animações
// ============================================================================

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Carregar mensagem especial
  await loadSurpriseMessage();
  
  // Criar confete e corações flutuantes
  createConfetti();
  createFloatingHearts();
});

// ============================================================================
// CARREGAR MENSAGEM
// ============================================================================

async function loadSurpriseMessage() {
  const config = await supabase.getConfig();
  const agenda = await supabase.getAgenda();
  
  const titleEl = document.getElementById('surpriseTitle');
  const messageEl = document.getElementById('surpriseMessage');
  
  if (!titleEl || !messageEl) return;
  
  // Verificar se há data especial hoje
  const today = DateUtils.toISODate(new Date());
  const todayEvent = agenda.find(e => DateUtils.toISODate(e.data) === today);
  
  if (todayEvent) {
    // Há um evento especial hoje
    titleEl.textContent = `${todayEvent.titulo}! 🎉`;
    messageEl.innerHTML = `
      <p>${todayEvent.mensagem || 'Hoje é um dia muito especial para nós!'}</p>
      <p style="margin-top: var(--spacing-lg);">
        Você significa tudo para mim.
        <span class="heart-animation">❤️</span>
      </p>
    `;
  } else {
    // Mensagem padrão
    titleEl.textContent = `Surpresa Especial para Você! 🎁`;
    messageEl.innerHTML = `
      <p>Você é o amor da minha vida.</p>
      <p style="margin-top: var(--spacing-md);">
        Cada dia ao seu lado é uma bênção.
        <span class="heart-animation">💕</span>
      </p>
      <p style="margin-top: var(--spacing-md);">
        Obrigado por ser tão especial!
      </p>
    `;
  }
}

// ============================================================================
// EFEITOS VISUAIS
// ============================================================================

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
      
      // Remover após animação
      setTimeout(() => confetti.remove(), 3500);
    }, i * 30);
  }
}

function createFloatingHearts() {
  const hearts = ['❤️', '💕', '💖', '💗', '💝'];
  const heartCount = 10;
  
  for (let i = 0; i < heartCount; i++) {
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

// ============================================================================
// FIM DO SCRIPT
// ============================================================================
