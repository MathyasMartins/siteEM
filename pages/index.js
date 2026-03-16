let currentSlideIndex = 0;
let fotos = [];
let recadinhos = [];

const notifiedKeys = new Set();

document.addEventListener('DOMContentLoaded', async () => {
  updateThemeToggle();
  if (!ensureAuthenticated()) return;

  await authManager.ensureProfile();
  await loadConfig();
  await loadFotos();
  await loadRecadinhos();
  await checkTodayAgendaNotifications();
  await renderSurpriseFloatingButton();
  await renderTodaySpecialScreen();

  if (fotos.length > 0) startSlideshow();

  updateCounters();
  setInterval(async () => {
    updateCounters();
    await checkMeetingNotification();
    await checkTodayAgendaNotifications();
    await renderTodaySpecialScreen();
  }, 60000);

  setupRecadinhoForm();
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
});

async function loadConfig() {
  const config = await supabaseApi.getConfig();
  if (config) {
    const coupleNameHero = document.getElementById('coupleNameHero');
    if (coupleNameHero) coupleNameHero.textContent = config.nome_casal;
    window.config = config;
  }
}

function updateCounters() {
  if (!window.config) return;
  const config = window.config;
  const agora = new Date();
  agora.setHours(0, 0, 0, 0);

  const inicioRaw = config.inicio_relacionamento;
  let inicio;

  if (typeof inicioRaw === 'string') {
    if (inicioRaw.includes('/')) {
      const partes = inicioRaw.split('/');
      inicio = new Date(partes[2], partes[1] - 1, partes[0]);
    } else if (inicioRaw.includes('-')) {
      const partes = inicioRaw.split('-');
      inicio = new Date(partes[0], partes[1] - 1, partes[2]);
    }
  } else if (inicioRaw instanceof Date) {
    inicio = new Date(inicioRaw);
  }

  if (!inicio || isNaN(inicio)) return;
  inicio.setHours(0, 0, 0, 0);

  const totalDias = Math.floor((agora - inicio) / (1000 * 60 * 60 * 24));
  let meses = (agora.getFullYear() - inicio.getFullYear()) * 12 + (agora.getMonth() - inicio.getMonth());
  let dataBase = new Date(inicio);
  dataBase.setMonth(inicio.getMonth() + meses);

  if (dataBase > agora) {
    meses--;
    dataBase = new Date(inicio);
    dataBase.setMonth(inicio.getMonth() + meses);
  }

  const diasRestantes = Math.floor((agora - dataBase) / (1000 * 60 * 60 * 24));

  if (meses <= 0) {
    document.getElementById('togetherDays').textContent = totalDias;
    document.getElementById('togetherText').textContent = `${totalDias} ${totalDias === 1 ? 'dia' : 'dias'} juntos ❤️`;
  } else {
    document.getElementById('togetherDays').textContent = meses;
    document.getElementById('togetherText').textContent = diasRestantes === 0
      ? `Estamos há ${meses} ${meses === 1 ? 'mês' : 'meses'} juntos ❤️`
      : `${meses} ${meses === 1 ? 'mês' : 'meses'} e ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'} juntos ❤️`;
  }

  const apartDiff = DateUtils.calculateDifference(config.ultima_vez_vistos);
  document.getElementById('apartDays').textContent = apartDiff.days;
  document.getElementById('apartText').textContent = `${apartDiff.hours}h ${apartDiff.minutes}m`;

  const encontro = new Date(config.proximo_encontro + 'T23:59:59');
  const diff = encontro - agora;

  if (diff <= 0) {
    document.getElementById('nextMeetingDays').textContent = '0';
    document.getElementById('nextMeetingText').textContent = 'É hoje ❤️';
  } else {
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / (1000 * 60)) % 60);
    document.getElementById('nextMeetingDays').textContent = dias;
    document.getElementById('nextMeetingText').textContent = `${horas}h ${minutos.toString().padStart(2, '0')}m`;
  }
}

async function loadFotos() {
  fotos = await supabaseApi.getFotos();

  if (fotos.length === 0) {
    const slideshowContainer = document.getElementById('slideshowContainer');
    if (slideshowContainer) {
      slideshowContainer.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;background-color:var(--bg-secondary);color:var(--text-secondary);text-align:center;padding:var(--spacing-lg);"><p>Nenhuma foto adicionada ainda.</p></div>`;
    }
    return;
  }

  renderSlideshow();
}

function renderSlideshow() {
  const container = document.getElementById('slideshowContainer');
  const nav = document.getElementById('slideshowNav');
  if (!container || !nav) return;

  container.innerHTML = '';
  nav.innerHTML = '';

  fotos.forEach((foto, index) => {
    const img = document.createElement('img');
    img.src = foto.url;
    img.alt = `Foto ${index + 1}`;
    img.className = 'slideshow-image';
    if (index === 0) img.classList.add('active');
    container.appendChild(img);

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
  }, 5000);
}

function showSlide(index) {
  document.querySelectorAll('.slideshow-image').forEach((img) => img.classList.remove('active'));
  document.querySelectorAll('.slideshow-dot').forEach((dot) => dot.classList.remove('active'));
  document.querySelectorAll('.slideshow-image')[index]?.classList.add('active');
  document.querySelectorAll('.slideshow-dot')[index]?.classList.add('active');
}

function goToSlide(index) {
  currentSlideIndex = index;
  showSlide(index);
}

async function loadRecadinhos() {
  recadinhos = await supabaseApi.getRecadinhos(true);
  renderRecadinhos();
}

function renderRecadinhos() {
  const container = document.getElementById('recadinhosContainer');
  if (!container) return;
  container.innerHTML = '';

  if (recadinhos.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-lg);"><p style="color: var(--text-secondary);">Ainda não há recadinhos. Seja o primeiro a deixar um!</p></div>`;
    return;
  }

  recadinhos.forEach((recadinho) => {
    const card = document.createElement('div');
    card.className = 'recadinho-card';
    card.innerHTML = `<p class="recadinho-text">${escapeHtml(recadinho.mensagem)}</p><p class="recadinho-author">— ${recadinho.autor}</p>`;
    container.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setupRecadinhoForm() {
  const form = document.getElementById('recadinhoForm');
  const textarea = document.getElementById('recadinhoMessage');
  const charCount = document.getElementById('charCount');

  if (!form) return;

  textarea?.addEventListener('input', () => {
    charCount.textContent = `${textarea.value.length}/200`;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = textarea.value.trim();
    if (!message) return showNotification('Por favor, escreva uma mensagem', 'warning');

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const author = authManager.getDisplayName();
    const recadinho = await supabaseApi.insertRecadinho(author, message);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar Recadinho ❤️';

    if (recadinho) {
      await notificationManager.createNotification({
        tipo: 'recado',
        mensagem: `${author} enviou um novo recadinho.`,
        autorEmail: authManager.getUser()?.email || null,
        referenciaId: recadinho.id
      });

      showNotification('Recadinho enviado com sucesso!', 'success');
      textarea.value = '';
      charCount.textContent = '0/200';
      await loadRecadinhos();
    } else {
      showNotification('Erro ao enviar recadinho', 'error');
    }
  });
}

async function checkMeetingNotification() {
  if (!window.config?.proximo_encontro) return;
  const hoje = DateUtils.toISODate(new Date());
  if (window.config.proximo_encontro === hoje) {
    oneSignalManager.notifyOnce('meeting-today', 'Hoje é dia de nos vermos! ❤️', 'O grande dia chegou!');
  }
}

async function checkTodayAgendaNotifications() {
  const agenda = await supabaseApi.getAgenda();
  const hoje = DateUtils.toISODate(new Date());

  for (const item of agenda.filter((entry) => DateUtils.toISODate(entry.data) === hoje)) {
    const localKey = `agenda-arrival-${item.id}-${hoje}`;

    if (!localStorage.getItem(localKey)) {
      await notificationManager.createNotification({
        tipo: 'agenda',
        mensagem: `Hoje é o dia de "${item.titulo}" 🎉`,
        autorEmail: null,
        referenciaId: item.id
      });
      localStorage.setItem(localKey, '1');
    }

    oneSignalManager.notifyOnce(`agenda-${item.id}-${hoje}`, 'Data especial chegou 🎉', item.titulo);
  }
}

async function renderSurpriseFloatingButton() {
  const surpresas = await supabaseApi.getSurpresas();
  const hoje = DateUtils.toISODate(new Date());
  const user = authManager.getUser();

  const surpresa = surpresas.find((item) => item.data === hoje && item.created_by !== user?.id);
  if (!surpresa) return;

  const container = document.createElement('div');
  container.className = 'floating-surprise';
  container.innerHTML = `
    <p><strong>${surpresa.created_by_email || 'Usuário Logado'}</strong> preparou uma surpresa pra você! Clique e veja!</p>
    <a href="surpresa.html?surpresa=${surpresa.id}" class="btn btn-primary">Ver Surpresa 🎁</a>
  `;

  document.body.appendChild(container);
}


function getAgendaCreatorKey(item) {
  return item?.created_by || item?.created_by_email || null;
}

function shouldHideSpecialFromCreator(item, user) {
  if (!item || !user) return false;
  return item.created_by === user.id || item.created_by_email === user.email;
}

function buildSpecialOverlayHtml(title, message) {
  return `
    <div class="surprise-content">
      <h1>${escapeHtml(title)} 🎉</h1>
      <p>${escapeHtml(message || 'Hoje é um dia muito especial para nós!')}</p>
      <button class="btn btn-secondary" id="closeSpecialOverlayBtn">Continuar no site ❤️</button>
    </div>
  `;
}

async function renderTodaySpecialScreen() {
  const currentOverlay = document.getElementById('todaySpecialOverlay');
  const hoje = DateUtils.toISODate(new Date());
  const user = authManager.getUser();

  const [surpresas, agenda] = await Promise.all([
    supabaseApi.getSurpresas(),
    supabaseApi.getAgenda()
  ]);

  const surpresaDoDia = surpresas.find((item) => DateUtils.toISODate(item.data) === hoje && !shouldHideSpecialFromCreator(item, user));
  const agendaDoDia = agenda.find((item) => DateUtils.toISODate(item.data) === hoje && !shouldHideSpecialFromCreator(item, user));
  const itemDoDia = surpresaDoDia || agendaDoDia;

  if (!itemDoDia) {
    if (currentOverlay) currentOverlay.remove();
    return;
  }

  const creatorKey = getAgendaCreatorKey(itemDoDia);
  const localKey = `today-special-overlay-${itemDoDia.id}-${hoje}-${creatorKey || 'anon'}`;
  if (localStorage.getItem(localKey) === '1') {
    if (currentOverlay) currentOverlay.remove();
    return;
  }

  if (currentOverlay) return;

  const overlay = document.createElement('section');
  overlay.id = 'todaySpecialOverlay';
  overlay.className = 'index-special-overlay surprise-container';
  overlay.innerHTML = buildSpecialOverlayHtml(itemDoDia.titulo || 'Dia Especial', itemDoDia.mensagem);

  document.body.appendChild(overlay);

  document.getElementById('closeSpecialOverlayBtn')?.addEventListener('click', () => {
    localStorage.setItem(localKey, '1');
    overlay.remove();
  });
}

function updateThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (toggle) toggle.textContent = themeManager.isDarkMode() ? '☀️' : '🌙';
}

function toggleTheme() {
  themeManager.toggle();
  updateThemeToggle();
}
