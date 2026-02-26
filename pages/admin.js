// ============================================================================
// PÁGINA DE ADMINISTRAÇÃO - admin.html
// ============================================================================
// Lógica para login, configurações, upload de fotos, gerenciamento de
// recadinhos, agenda, backup e restauração
// ============================================================================

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Aplicar tema
  updateThemeToggle();
  
  // Verificar autenticação
  checkAuthentication();
  
  // Configurar theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
});

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

function checkAuthentication() {
  const loginSection = document.getElementById('loginSection');
  const adminDashboard = document.getElementById('adminDashboard');
  
  if (!loginSection || !adminDashboard) return;
  
  if (adminAuth.isPasswordSet() && adminAuth.isLoggedIn()) {
    // Usuário logado
    loginSection.style.display = 'none';
    adminDashboard.style.display = 'block';
    setupAdminDashboard();
  } else if (adminAuth.isPasswordSet()) {
    // Senha já foi definida, mostrar login
    loginSection.style.display = 'block';
    adminDashboard.style.display = 'none';
    setupLoginForm();
  } else {
    // Primeira vez, definir senha
    loginSection.style.display = 'block';
    adminDashboard.style.display = 'none';
    setupFirstTimePassword();
  }
}

function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  
  form.innerHTML = `
    <div class="form-group">
      <label for="adminPassword">Senha de Administrador</label>
      <input 
        type="password" 
        id="adminPassword" 
        placeholder="Digite sua senha"
        required>
    </div>
    <button type="submit" class="btn btn-primary btn-large" style="width: 100%;">Entrar</button>
  `;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    if (adminAuth.login(password)) {
      showNotification('Login realizado com sucesso!', 'success');
      setTimeout(() => checkAuthentication(), 500);
    } else {
      showNotification('Senha incorreta', 'error');
      document.getElementById('adminPassword').value = '';
    }
  });
}

function setupFirstTimePassword() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  
  const loginSection = document.getElementById('loginSection');
  if (loginSection) {
    loginSection.querySelector('h1').textContent = 'Primeira Vez? 🔐';
    loginSection.querySelector('p').textContent = 'Defina uma senha para proteger a administração';
  }
  
  form.innerHTML = `
    <div class="form-group">
      <label for="adminPassword">Defina uma Senha</label>
      <input 
        type="password" 
        id="adminPassword" 
        placeholder="Digite uma senha forte"
        required>
    </div>
    <div class="form-group">
      <label for="adminPasswordConfirm">Confirme a Senha</label>
      <input 
        type="password" 
        id="adminPasswordConfirm" 
        placeholder="Confirme a senha"
        required>
    </div>
    <button type="submit" class="btn btn-primary btn-large" style="width: 100%;">Definir Senha</button>
  `;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    const passwordConfirm = document.getElementById('adminPasswordConfirm').value;
    
    if (password.length < 4) {
      showNotification('A senha deve ter pelo menos 4 caracteres', 'warning');
      return;
    }
    
    if (password !== passwordConfirm) {
      showNotification('As senhas não correspondem', 'error');
      return;
    }
    
    adminAuth.setPassword(password);
    adminAuth.login(password);
    showNotification('Senha definida com sucesso!', 'success');
    setTimeout(() => checkAuthentication(), 500);
  });
}

// ============================================================================
// DASHBOARD DE ADMINISTRAÇÃO
// ============================================================================

async function setupAdminDashboard() {
  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      adminAuth.logout();
      showNotification('Desconectado com sucesso', 'info');
      setTimeout(() => checkAuthentication(), 500);
    });
  }
  
  // Carregar dados
  await loadConfigForm();
  await loadPhotosSection();
  await loadRecadinhosSection();
  await loadAgendaSection();
  await setupBackupRestore();
}

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

async function loadConfigForm() {
  const form = document.getElementById('configForm');
  if (!form) return;
  
  const config = await supabase.getConfig();
  
  if (config) {
    document.getElementById('coupleNameInput').value = config.nome_casal;
    document.getElementById('startDateInput').value = DateUtils.toISODate(config.inicio_relacionamento);
    document.getElementById('lastMeetInput').value = DateUtils.toISODate(config.ultima_vez_vistos);
    document.getElementById('nextMeetInput').value = DateUtils.toISODate(config.proximo_encontro);
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const updates = {
      nome_casal: document.getElementById('coupleNameInput').value,
      inicio_relacionamento: document.getElementById('startDateInput').value,
      ultima_vez_vistos: document.getElementById('lastMeetInput').value,
      proximo_encontro: document.getElementById('nextMeetInput').value
    };
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';
    
    const result = await supabase.updateConfig(updates);
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Salvar Configurações';
    
    if (result) {
      showNotification('Configurações salvas com sucesso!', 'success');
      window.config = updates;
    } else {
      showNotification('Erro ao salvar configurações', 'error');
    }
  });
}

// ============================================================================
// FOTOS
// ============================================================================

async function loadPhotosSection() {
  const uploadForm = document.getElementById('uploadForm');
  if (!uploadForm) return;
  
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('photoInput');
    const file = fileInput.files[0];
    
    if (!file) {
      showNotification('Por favor, selecione uma foto', 'warning');
      return;
    }
    
    const submitBtn = uploadForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    try {
      // Upload para Cloudinary
      const imageUrl = await cloudinary.uploadImage(file);
      
      if (!imageUrl) {
        throw new Error('Erro ao fazer upload');
      }
      
      // Salvar URL no Supabase
      const result = await supabase.insertFoto(imageUrl);
      
      if (result) {
        showNotification('Foto enviada com sucesso!', 'success');
        fileInput.value = '';
        
        // // Atualizar última vez vistos
        // const today = DateUtils.toISODate(new Date());
        // await supabase.updateConfig({ ultima_vez_vistos: today });
        
        // Recarregar lista de fotos
        await loadPhotosSection();
      } else {
        throw new Error('Erro ao salvar foto');
      }
    } catch (error) {
      console.error('Erro:', error);
      showNotification('Erro ao enviar foto: ' + error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar Foto';
    }
  });
  
  // Carregar lista de fotos
  const fotos = await supabase.getFotos();
  const photosList = document.getElementById('photosList');
  
  if (photosList) {
    photosList.innerHTML = '';
    
    if (fotos.length === 0) {
      photosList.innerHTML = '<p style="color: var(--text-secondary);">Nenhuma foto adicionada ainda.</p>';
      return;
    }
    
    fotos.forEach(foto => {
      const item = document.createElement('div');
      item.className = 'admin-item';
      item.innerHTML = `
        <img src="${foto.url}" style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-md);">
        <div style="flex: 1; margin-left: var(--spacing-md);">
          <p style="margin: 0; color: var(--text-secondary); font-size: var(--font-size-sm);">
            ${DateUtils.formatDate(foto.criado_em)}
          </p>
        </div>
        <div class="admin-item-actions">
          <button class="btn btn-small btn-outline" onclick="deleteFoto(${foto.id})">Deletar</button>
        </div>
      `;
      photosList.appendChild(item);
    });
  }
}

async function deleteFoto(id) {
  if (!confirm('Tem certeza que deseja deletar esta foto?')) return;
  
  const result = await supabase.deleteFoto(id);
  if (result) {
    showNotification('Foto deletada com sucesso!', 'success');
    await loadPhotosSection();
  } else {
    showNotification('Erro ao deletar foto', 'error');
  }
}

// ============================================================================
// RECADINHOS
// ============================================================================
async function loadRecadinhosSection() {
  const form = document.getElementById('addRecadinhoForm');
  if (!form) return;

  // Evita múltiplos listeners
  if (form.dataset.listenerAdded === "true") return;
  form.dataset.listenerAdded = "true";

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = document.getElementById('myRecadinhoInput').value.trim();

    if (!message) {
      showNotification('Por favor, escreva uma mensagem', 'warning');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adicionando...';

    const result = await supabase.insertRecadinho('Eu', message);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Adicionar Recadinho';

    if (result) {
      showNotification('Recadinho adicionado com sucesso!', 'success');
      document.getElementById('myRecadinhoInput').value = '';

      // ❌ REMOVIDO o loadRecadinhosSection()
      // Aqui você deve chamar apenas a função que recarrega os recados
      if (typeof carregarRecadinhos === "function") {
        await carregarRecadinhos();
      }

    } else {
      showNotification('Erro ao adicionar recadinho', 'error');
    }
  });
}
  
  // Carregar recadinhos pendentes
  const pendingRecadinhos = await supabase.getRecadinhos(false);
  const pendingList = document.getElementById('pendingRecadinhosList');
  
  if (pendingList) {
    pendingList.innerHTML = '';
    const pending = pendingRecadinhos.filter(r => !r.aprovado);
    
    if (pending.length === 0) {
      pendingList.innerHTML = '<p style="color: var(--text-secondary);">Nenhum recadinho pendente.</p>';
    } else {
      pending.forEach(recadinho => {
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
          <div style="flex: 1;">
            <p style="margin: 0; color: var(--text-primary);">${escapeHtml(recadinho.mensagem)}</p>
            <p style="margin: var(--spacing-xs) 0 0 0; color: var(--text-secondary); font-size: var(--font-size-sm);">
              ${recadinho.autor} • ${DateUtils.formatDate(recadinho.criado_em)}
            </p>
          </div>
          <div class="admin-item-actions">
            <button class="btn btn-small btn-primary" onclick="approveRecadinho(${recadinho.id})">Aprovar</button>
            <button class="btn btn-small btn-outline" onclick="deleteRecadinho(${recadinho.id})">Deletar</button>
          </div>
        `;
        pendingList.appendChild(item);
      });
    }
  }
  
  // Carregar todos os recadinhos
  const allList = document.getElementById('allRecadinhosList');
  if (allList) {
    allList.innerHTML = '';
    
    if (pendingRecadinhos.length === 0) {
      allList.innerHTML = '<p style="color: var(--text-secondary);">Nenhum recadinho.</p>';
    } else {
      pendingRecadinhos.forEach(recadinho => {
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
          <div style="flex: 1;">
            <p style="margin: 0; color: var(--text-primary);">${escapeHtml(recadinho.mensagem)}</p>
            <p style="margin: var(--spacing-xs) 0 0 0; color: var(--text-secondary); font-size: var(--font-size-sm);">
              ${recadinho.autor} • ${DateUtils.formatDate(recadinho.criado_em)} 
              ${recadinho.aprovado ? '✓ Aprovado' : '⏳ Pendente'}
            </p>
          </div>
          <div class="admin-item-actions">
            ${!recadinho.aprovado ? `<button class="btn btn-small btn-primary" onclick="approveRecadinho(${recadinho.id})">Aprovar</button>` : ''}
            <button class="btn btn-small btn-outline" onclick="deleteRecadinho(${recadinho.id})">Deletar</button>
          </div>
        `;
        allList.appendChild(item);
      });
    }
  }


async function approveRecadinho(id) {
  const result = await supabase.updateRecadinho(id, { aprovado: true });
  if (result) {
    showNotification('Recadinho aprovado!', 'success');
    await loadRecadinhosSection();
  } else {
    showNotification('Erro ao aprovar recadinho', 'error');
  }
}

async function deleteRecadinho(id) {
  if (!confirm('Tem certeza que deseja deletar este recadinho?')) return;
  
  const result = await supabase.deleteRecadinho(id);
  if (result) {
    showNotification('Recadinho deletado com sucesso!', 'success');
    await loadRecadinhosSection();
  } else {
    showNotification('Erro ao deletar recadinho', 'error');
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// AGENDA
// ============================================================================

async function loadAgendaSection() {
  const form = document.getElementById('addAgendaForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titulo = document.getElementById('agendaTitleInput').value.trim();
    const data = document.getElementById('agendaDateInput').value;
    const mensagem = document.getElementById('agendaMessageInput').value.trim();
    
    if (!titulo || !data) {
      showNotification('Por favor, preencha título e data', 'warning');
      return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adicionando...';
    
    const result = await supabase.insertAgenda(titulo, data, mensagem || null);
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Adicionar à Agenda';
    
    if (result) {
      showNotification('Data adicionada à agenda!', 'success');
      document.getElementById('agendaTitleInput').value = '';
      document.getElementById('agendaDateInput').value = '';
      document.getElementById('agendaMessageInput').value = '';
      await loadAgendaSection();
    } else {
      showNotification('Erro ao adicionar à agenda', 'error');
    }
  });
  
  // Carregar agenda
  const agenda = await supabase.getAgenda();
  const agendaList = document.getElementById('agendaList');
  
  if (agendaList) {
    agendaList.innerHTML = '';
    
    if (agenda.length === 0) {
      agendaList.innerHTML = '<p style="color: var(--text-secondary);">Nenhuma data especial adicionada.</p>';
    } else {
      agenda.forEach(evento => {
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
          <div style="flex: 1;">
            <p style="margin: 0; color: var(--text-primary); font-weight: 600;">${evento.titulo}</p>
            <p style="margin: var(--spacing-xs) 0 0 0; color: var(--text-secondary); font-size: var(--font-size-sm);">
              ${DateUtils.formatDate(evento.data)}
              ${evento.mensagem ? `<br>${evento.mensagem}` : ''}
            </p>
          </div>
          <div class="admin-item-actions">
            <button class="btn btn-small btn-outline" onclick="deleteAgenda(${evento.id})">Deletar</button>
          </div>
        `;
        agendaList.appendChild(item);
      });
    }
  }
}

async function deleteAgenda(id) {
  if (!confirm('Tem certeza que deseja deletar este evento?')) return;
  
  const result = await supabase.deleteAgenda(id);
  if (result) {
    showNotification('Evento deletado com sucesso!', 'success');
    await loadAgendaSection();
  } else {
    showNotification('Erro ao deletar evento', 'error');
  }
}

// ============================================================================
// BACKUP E RESTAURAÇÃO
// ============================================================================

async function setupBackupRestore() {
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      exportBtn.disabled = true;
      exportBtn.textContent = 'Exportando...';
      
      const dados = await supabase.exportarDados();
      
      if (dados) {
        const json = JSON.stringify(dados, null, 2);
        const filename = `site-romantico-backup-${new Date().toISOString().split('T')[0]}.json`;
        downloadFile(json, filename, 'application/json');
        showNotification('Backup exportado com sucesso!', 'success');
      } else {
        showNotification('Erro ao exportar backup', 'error');
      }
      
      exportBtn.disabled = false;
      exportBtn.textContent = 'Exportar JSON 📥';
    });
  }
  
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      importFile.click();
    });
  }
  
  if (importFile) {
    importFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const dados = JSON.parse(event.target.result);
          
          if (!confirm('Tem certeza que deseja importar estes dados? Isso pode sobrescrever dados existentes.')) {
            return;
          }
          
          const result = await supabase.importarDados(dados);
          
          if (result) {
            showNotification('Dados importados com sucesso!', 'success');
            setTimeout(() => location.reload(), 1000);
          } else {
            showNotification('Erro ao importar dados', 'error');
          }
        } catch (error) {
          console.error('Erro:', error);
          showNotification('Arquivo inválido', 'error');
        }
      };
      reader.readAsText(file);
    });
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
