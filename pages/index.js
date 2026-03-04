// ============================================================================
// PÁGINA INICIAL - index.html
// ============================================================================
// Lógica para contadores, slideshow, recadinhos e atualização em tempo real
// ============================================================================

let currentSlideIndex = 0;
let fotos = [];
let recadinhos = [];

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Aplicar tema
  updateThemeToggle();

  // Carregar dados
  await loadConfig();
  await loadFotos();
  await loadRecadinhos();

  // Iniciar slideshow
  if (fotos.length > 0) {
    startSlideshow();
  }

  // Atualizar contadores a cada minuto
  updateCounters();
  setInterval(updateCounters, 60000);

  // Configurar formulário de recadinho
  setupRecadinhoForm();

  // Configurar theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
});

// ============================================================================
// CARREGAR CONFIGURAÇÕES
// ============================================================================

async function loadConfig() {
  const config = await supabase.getConfig();

  if (config) {
    // Atualizar nome do casal
    const coupleNameHero = document.getElementById('coupleNameHero');
    if (coupleNameHero) {
      coupleNameHero.textContent = config.nome_casal;
    }

    // Salvar datas para cálculos
    window.config = config;
  }
}
// ============================================================================
// ATUALIZAR CONTADORES
// ============================================================================

function updateCounters() {
  if (!window.config) return;

  const config = window.config;

  // ================================
  // Contador: Estamos juntos há (à prova de erro)
  // ================================

  const agora = new Date();
  agora.setHours(0, 0, 0, 0);

  let inicioRaw = config.inicio_relacionamento;
  let inicio;

  // Detecta formato automaticamente
  if (typeof inicioRaw === "string") {

    if (inicioRaw.includes('/')) {
      // Formato DD/MM/YYYY
      const partes = inicioRaw.split('/');
      inicio = new Date(partes[2], partes[1] - 1, partes[0]);
    } else if (inicioRaw.includes('-')) {
      // Formato YYYY-MM-DD
      const partes = inicioRaw.split('-');
      inicio = new Date(partes[0], partes[1] - 1, partes[2]);
    }

  } else if (inicioRaw instanceof Date) {
    inicio = new Date(inicioRaw);
  }

  if (!inicio || isNaN(inicio)) {
    console.error("Data inválida:", inicioRaw);
    return;
  }

  inicio.setHours(0, 0, 0, 0);

  // Total de dias juntos
  const totalDias = Math.floor((agora - inicio) / (1000 * 60 * 60 * 24));

  // Calcula meses completos
  let meses =
    (agora.getFullYear() - inicio.getFullYear()) * 12 +
    (agora.getMonth() - inicio.getMonth());

  let dataBase = new Date(inicio);
  dataBase.setMonth(inicio.getMonth() + meses);

  if (dataBase > agora) {
    meses--;
    dataBase = new Date(inicio);
    dataBase.setMonth(inicio.getMonth() + meses);
  }

  let diasRestantes = Math.floor((agora - dataBase) / (1000 * 60 * 60 * 24));

  // ================================
  // EXIBIÇÃO
  // ================================

  if (meses <= 0) {

    document.getElementById('togetherDays').textContent = totalDias;
    document.getElementById('togetherText').textContent =
      `${totalDias} ${totalDias === 1 ? 'dia' : 'dias'} juntos ❤️`;

  } else {

    document.getElementById('togetherDays').textContent = meses;

    if (diasRestantes === 0) {
      document.getElementById('togetherText').textContent =
        `Estamos há ${meses} ${meses === 1 ? 'mês' : 'meses'} juntos ❤️`;
    } else {
      document.getElementById('togetherText').textContent =
        `${meses} ${meses === 1 ? 'mês' : 'meses'} e ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'} juntos ❤️`;
    }
  }
  // ================================
  // Contador: Sem nos ver há
  // ================================
  const apartDiff = DateUtils.calculateDifference(config.ultima_vez_vistos);

  document.getElementById('apartDays').textContent = apartDiff.days;
  document.getElementById('apartText').textContent =
    `${apartDiff.hours}h ${apartDiff.minutes}m`;

  // ================================
  // Contador: Faltam para nos vermos
  // ================================

  // força o encontro para o FINAL do dia
  const encontro = new Date(config.proximo_encontro + "T23:59:59");

  const diff = encontro - agora;

  if (diff <= 0) {
    document.getElementById('nextMeetingDays').textContent = '0';
    document.getElementById('nextMeetingText').textContent = 'É hoje ❤️';
  } else {

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / (1000 * 60)) % 60);

    document.getElementById('nextMeetingDays').textContent = dias;
    document.getElementById('nextMeetingText').textContent =
      `${horas}h ${minutos.toString().padStart(2, '0')}m`;
  }
}

// ============================================================================
// SLIDESHOW
// ============================================================================

async function loadFotos() {
  fotos = await supabase.getFotos();

  if (fotos.length === 0) {
    const slideshowContainer = document.getElementById('slideshowContainer');
    if (slideshowContainer) {
      slideshowContainer.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
          text-align: center;
          padding: var(--spacing-lg);
        ">
          <p>Nenhuma foto adicionada ainda.<br>
          <a href="admin.html" style="color: var(--color-primary);">Adicione fotos na administração!</a></p>
        </div>
      `;
    }
    return;
  }

  // Renderizar slideshow
  renderSlideshow();
}

function renderSlideshow() {
  const container = document.getElementById('slideshowContainer');
  const nav = document.getElementById('slideshowNav');

  if (!container || !nav) return;

  // Limpar container
  container.innerHTML = '';
  nav.innerHTML = '';

  // Adicionar imagens
  fotos.forEach((foto, index) => {
    const img = document.createElement('img');
    img.src = foto.url;
    img.alt = `Foto ${index + 1}`;
    img.className = 'slideshow-image';
    if (index === 0) img.classList.add('active');
    container.appendChild(img);

    // Adicionar dot
    const dot = document.createElement('button');
    dot.className = 'slideshow-dot';
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    nav.appendChild(dot);
  });
}

function startSlideshow() {
  if (fotos.length <= 1) return;

  setInterval(() => {
    currentSlideIndex = (currentSlideIndex + 1) % fotos.length;
    showSlide(currentSlideIndex);
  }, 5000); // Trocar a cada 5 segundos
}

function showSlide(index) {
  const images = document.querySelectorAll('.slideshow-image');
  const dots = document.querySelectorAll('.slideshow-dot');

  images.forEach(img => img.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  if (images[index]) {
    images[index].classList.add('active');
  }
  if (dots[index]) {
    dots[index].classList.add('active');
  }
}

function goToSlide(index) {
  currentSlideIndex = index;
  showSlide(index);
}

// ============================================================================
// RECADINHOS
// ============================================================================

async function loadRecadinhos() {
  recadinhos = await supabase.getRecadinhos(true); // Apenas aprovados
  renderRecadinhos();
}

function renderRecadinhos() {
  const container = document.getElementById('recadinhosContainer');
  if (!container) return;

  container.innerHTML = '';

  if (recadinhos.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-lg);">
        <p style="color: var(--text-secondary);">Ainda não há recadinhos. Seja o primeiro a deixar um!</p>
      </div>
    `;
    return;
  }

  recadinhos.forEach(recadinho => {
    const card = document.createElement('div');
    card.className = 'recadinho-card';
    card.innerHTML = `
      <p class="recadinho-text">${escapeHtml(recadinho.mensagem)}</p>
      <p class="recadinho-author">— ${recadinho.autor}</p>
    `;
    container.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// FORMULÁRIO DE RECADINHO
// ============================================================================

function setupRecadinhoForm() {
  const form = document.getElementById('recadinhoForm');
  const textarea = document.getElementById('recadinhoMessage');
  const charCount = document.getElementById('charCount');

  if (!form) return;

  // Atualizar contador de caracteres
  if (textarea) {
    textarea.addEventListener('input', () => {
      charCount.textContent = `${textarea.value.length}/200`;
    });
  }

  // Enviar formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = textarea.value.trim();

    if (!message) {
      showNotification('Por favor, escreva uma mensagem', 'warning');
      return;
    }

    // Desabilitar botão
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      // Inserir recadinho
      const result = await supabase.insertRecadinho('Minha Princesa', message);

      if (result) {
        showNotification('Recadinho enviado com sucesso! Aguardando aprovação.', 'success');
        textarea.value = '';
        charCount.textContent = '0/200';
      } else {
        showNotification('Erro ao enviar recadinho', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showNotification('Erro ao enviar recadinho', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar Recadinho ❤️';
    }
  });
}

// ============================================================================
// TEMA
// ============================================================================

function updateThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.textContent = themeManager.isDarkMode() ? '☀️' : '🌙';
  }
}

function toggleTheme() {
  themeManager.toggle();
  updateThemeToggle();
}

// ============================================================================
// FIM DO SCRIPT
// ============================================================================