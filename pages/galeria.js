// ============================================================================
// PÁGINA DE GALERIA - galeria.html
// ============================================================================
// Lógica para exibir grid de fotos e lightbox
// ============================================================================

let fotos = [];
let currentLightboxIndex = 0;

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Aplicar tema
  updateThemeToggle();
  if (!ensureAuthenticated()) return;
  
  // Carregar fotos
  await loadFotos();
  
  // Configurar lightbox
  setupLightbox();
  
  // Configurar theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
});

// ============================================================================
// CARREGAR FOTOS
// ============================================================================

async function loadFotos() {
  fotos = await supabaseApi.getFotos();
  renderGallery();
}

function renderGallery() {
  const galleryGrid = document.getElementById('galleryGrid');
  const noPhotosMessage = document.getElementById('noPhotosMessage');
  
  if (!galleryGrid || !noPhotosMessage) return;
  
  if (fotos.length === 0) {
    galleryGrid.classList.add('hidden');
    noPhotosMessage.classList.remove('hidden');
    return;
  }
  
  galleryGrid.classList.remove('hidden');
  noPhotosMessage.classList.add('hidden');
  
  galleryGrid.innerHTML = '';
  
  fotos.forEach((foto, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `<img src="${foto.url}" alt="Foto ${index + 1}">`;
    item.addEventListener('click', () => openLightbox(index));
    galleryGrid.appendChild(item);
  });
}

// ============================================================================
// LIGHTBOX
// ============================================================================

function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  
  if (!lightbox) return;
  
  // Fechar lightbox
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }
  
  // Navegação
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentLightboxIndex = (currentLightboxIndex - 1 + fotos.length) % fotos.length;
      updateLightboxImage();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentLightboxIndex = (currentLightboxIndex + 1) % fotos.length;
      updateLightboxImage();
    });
  }
  
  // Fechar ao clicar fora da imagem
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  // Navegação com teclado
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'ArrowLeft') {
      currentLightboxIndex = (currentLightboxIndex - 1 + fotos.length) % fotos.length;
      updateLightboxImage();
    } else if (e.key === 'ArrowRight') {
      currentLightboxIndex = (currentLightboxIndex + 1) % fotos.length;
      updateLightboxImage();
    } else if (e.key === 'Escape') {
      closeLightbox();
    }
  });
}

function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  
  currentLightboxIndex = index;
  lightbox.classList.add('active');
  updateLightboxImage();
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
  }
}

function updateLightboxImage() {
  const image = document.getElementById('lightboxImage');
  if (image && fotos[currentLightboxIndex]) {
    image.src = fotos[currentLightboxIndex].url;
  }
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
