document.addEventListener('DOMContentLoaded', async () => {
  updateThemeToggle();
  if (!ensureAuthenticated()) return;

  await setupAdminDashboard();

  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    authManager.logout();
    showNotification('Desconectado com sucesso', 'info');
    window.location.href = 'login.html';
  });
});

async function setupAdminDashboard() {
  await loadConfigForm();
  await loadPhotosSection();
  await loadRecadinhosSection();
  await loadAgendaSection();
  await loadSurpresasSection();
  await setupBackupRestore();
}

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

    showNotification(result ? 'Configurações salvas com sucesso!' : 'Erro ao salvar configurações', result ? 'success' : 'error');
  });
}

async function loadPhotosSection() {
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm && uploadForm.dataset.listenerAdded !== 'true') {
    uploadForm.dataset.listenerAdded = 'true';
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
        const uploaded = await cloudinary.uploadImage(file);
        if (!uploaded?.secureUrl) throw new Error('Erro no upload Cloudinary');

        const result = await supabase.insertFoto(uploaded.secureUrl, uploaded.publicId);
        if (!result) throw new Error('Erro ao salvar foto no Supabase');

        const user = authManager.getUser();
        oneSignalManager.notifyOnce(`foto-${url}`, 'Nova foto', `${user?.email || 'Usuário'} adicionou uma nova foto.`);
        showNotification('Foto enviada com sucesso!', 'success');
        fileInput.value = '';
        await loadPhotosSection();
      } catch (error) {
        showNotification(`Erro ao enviar foto: ${error.message}`, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Foto';
      }
    });
  }

  const fotos = await supabase.getFotos();
  const photosList = document.getElementById('photosList');
  if (!photosList) return;

  photosList.innerHTML = fotos.length
    ? ''
    : '<p style="color: var(--text-secondary);">Nenhuma foto adicionada ainda.</p>';

  fotos.forEach((foto) => {
    const item = document.createElement('div');
    item.className = 'admin-item';
    item.innerHTML = `
      <img src="${foto.url}" style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-md);">
      <div style="flex: 1; margin-left: var(--spacing-md);">
        <p style="margin: 0; color: var(--text-secondary); font-size: var(--font-size-sm);">${DateUtils.formatDate(foto.criado_em)}</p>
      </div>
      <div class="admin-item-actions">
        <button class="btn btn-small btn-outline" onclick="deleteFoto(${foto.id})">Deletar</button>
      </div>
    `;
    photosList.appendChild(item);
  });
}

async function deleteFoto(id) {
  if (!confirm('Tem certeza que deseja deletar esta foto?')) return;

  const foto = await supabase.getFotoById(id);
  if (foto?.public_id) {
    await cloudinary.deleteImage(foto.public_id);
  }

  const result = await supabase.deleteFoto(id);
  if (result) {
    showNotification('Foto deletada com sucesso!', 'success');
    await loadPhotosSection();
  } else {
    showNotification('Erro ao deletar foto', 'error');
  }
}

async function loadRecadinhosSection() {
  const form = document.getElementById('addRecadinhoForm');
  if (!form) return;

  if (form.dataset.listenerAdded !== 'true') {
    form.dataset.listenerAdded = 'true';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = document.getElementById('myRecadinhoInput').value.trim();
      if (!message) return showNotification('Por favor, escreva uma mensagem', 'warning');

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Adicionando...';

      const user = authManager.getUser();
      const autor = user?.email || 'Usuário';
      const result = await supabase.insertRecadinho(autor, message);

      submitBtn.disabled = false;
      submitBtn.textContent = 'Adicionar Recadinho';

      if (result) {
        oneSignalManager.notifyOnce(`recadinho-${Date.now()}`, 'Novo recadinho', `${autor} enviou um recadinho.`);
        showNotification('Recadinho adicionado com sucesso!', 'success');
        document.getElementById('myRecadinhoInput').value = '';
        await loadRecadinhosSection();
      } else {
        showNotification('Erro ao adicionar recadinho', 'error');
      }
    });
  }

  const recs = await supabase.getRecadinhos(false);
  const pendingList = document.getElementById('pendingRecadinhosList');
  const allList = document.getElementById('allRecadinhosList');
  const pending = recs.filter((r) => !r.aprovado);

  if (pendingList) {
    pendingList.innerHTML = pending.length ? '' : '<p style="color: var(--text-secondary);">Nenhum recadinho pendente.</p>';
    pending.forEach((recadinho) => {
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

  if (allList) {
    allList.innerHTML = recs.length ? '' : '<p style="color: var(--text-secondary);">Nenhum recadinho.</p>';
    recs.forEach((recadinho) => {
      const item = document.createElement('div');
      item.className = 'admin-item';
      item.innerHTML = `
        <div style="flex: 1;">
          <p style="margin: 0; color: var(--text-primary);">${escapeHtml(recadinho.mensagem)}</p>
          <p style="margin: var(--spacing-xs) 0 0 0; color: var(--text-secondary); font-size: var(--font-size-sm);">
            ${recadinho.autor} • ${DateUtils.formatDate(recadinho.criado_em)} ${recadinho.aprovado ? '✓ Aprovado' : '⏳ Pendente'}
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
  showNotification(result ? 'Recadinho aprovado!' : 'Erro ao aprovar recadinho', result ? 'success' : 'error');
  if (result) await loadRecadinhosSection();
}

async function deleteRecadinho(id) {
  if (!confirm('Tem certeza que deseja deletar este recadinho?')) return;
  const result = await supabase.deleteRecadinho(id);
  showNotification(result ? 'Recadinho deletado com sucesso!' : 'Erro ao deletar recadinho', result ? 'success' : 'error');
  if (result) await loadRecadinhosSection();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadAgendaSection() {
  const form = document.getElementById('addAgendaForm');
  if (!form) return;

  if (form.dataset.listenerAdded !== 'true') {
    form.dataset.listenerAdded = 'true';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titulo = document.getElementById('agendaTitleInput').value.trim();
      const data = document.getElementById('agendaDateInput').value;
      const mensagem = document.getElementById('agendaMessageInput').value.trim();

      if (!titulo || !data) return showNotification('Por favor, preencha título e data', 'warning');

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Adicionando...';

      const result = await supabase.insertAgenda(titulo, data, mensagem || null);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Adicionar à Agenda';

      if (result) {
        oneSignalManager.notifyOnce(`agenda-${result[0]?.id || Date.now()}`, 'Nova data especial', `"${titulo}" foi adicionada à agenda.`);
        showNotification('Data adicionada à agenda!', 'success');
        form.reset();
        await loadAgendaSection();
      } else {
        showNotification('Erro ao adicionar à agenda', 'error');
      }
    });
  }

  const agenda = await supabase.getAgenda();
  const agendaList = document.getElementById('agendaList');
  if (!agendaList) return;

  agendaList.innerHTML = agenda.length ? '' : '<p style="color: var(--text-secondary);">Nenhuma data especial adicionada.</p>';
  agenda.forEach((evento) => {
    const dataFormatada = evento.data ? evento.data.split('T')[0].split('-').reverse().join('/') : '';
    const item = document.createElement('div');
    item.className = 'admin-item';
    item.innerHTML = `
      <div style="flex: 1;">
        <p style="margin: 0; color: var(--text-primary); font-weight: 600;">${evento.titulo}</p>
        <p style="margin: var(--spacing-xs) 0 0 0; color: var(--text-secondary); font-size: var(--font-size-sm);">
          ${dataFormatada}${evento.mensagem ? `<br>${evento.mensagem}` : ''}
        </p>
      </div>
      <div class="admin-item-actions">
        <button class="btn btn-small btn-outline" onclick="deleteAgenda(${evento.id})">Deletar</button>
      </div>
    `;
    agendaList.appendChild(item);
  });
}

async function deleteAgenda(id) {
  if (!confirm('Tem certeza que deseja deletar este evento?')) return;
  const result = await supabase.deleteAgenda(id);
  showNotification(result ? 'Evento deletado com sucesso!' : 'Erro ao deletar evento', result ? 'success' : 'error');
  if (result) await loadAgendaSection();
}

async function loadSurpresasSection() {
  const form = document.getElementById('surpresaForm');
  const list = document.getElementById('surpresasList');
  const fotoSelect = document.getElementById('surpresaFotoSelect');
  const cancelBtn = document.getElementById('surpresaCancelBtn');

  const fotos = await supabase.getFotos();
  fotoSelect.innerHTML = '<option value="">Sem foto</option>';
  fotos.forEach((foto) => {
    const opt = document.createElement('option');
    opt.value = foto.id;
    opt.textContent = `Foto #${foto.id} - ${DateUtils.formatDate(foto.criado_em)}`;
    fotoSelect.appendChild(opt);
  });

  if (form.dataset.listenerAdded !== 'true') {
    form.dataset.listenerAdded = 'true';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('surpresaIdInput').value;
      const payload = {
        titulo: document.getElementById('surpresaTituloInput').value.trim(),
        data: document.getElementById('surpresaDataInput').value,
        mensagem: document.getElementById('surpresaMensagemInput').value.trim(),
        foto_id: document.getElementById('surpresaFotoSelect').value || null,
        created_by: authManager.getUser()?.id || null,
        created_by_email: authManager.getUser()?.email || null
      };

      if (!payload.titulo || !payload.data || !payload.mensagem) {
        return showNotification('Preencha título, data e mensagem.', 'warning');
      }

      const ok = id
        ? await supabase.updateSurpresa(id, payload)
        : !!(await supabase.insertSurpresa(payload));

      if (ok) {
        showNotification(id ? 'Surpresa atualizada!' : 'Surpresa criada!', 'success');
        form.reset();
        document.getElementById('surpresaIdInput').value = '';
        cancelBtn.style.display = 'none';
        await loadSurpresasSection();
      } else {
        showNotification('Erro ao salvar surpresa.', 'error');
      }
    });

    cancelBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('surpresaIdInput').value = '';
      cancelBtn.style.display = 'none';
    });
  }

  const surpresas = await supabase.getSurpresas();
  window.__surpresasCache = surpresas;
  if (!list) return;
  list.innerHTML = surpresas.length ? '' : '<p style="color: var(--text-secondary);">Nenhuma surpresa cadastrada.</p>';

  surpresas.forEach((surpresa) => {
    const item = document.createElement('div');
    item.className = 'admin-item';
    item.innerHTML = `
      <div style="flex:1;">
        <p style="margin:0;color:var(--text-primary);font-weight:700;">${escapeHtml(surpresa.titulo)}</p>
        <p style="margin:var(--spacing-xs) 0 0 0;color:var(--text-secondary);font-size:var(--font-size-sm);">
          ${surpresa.data?.split('-').reverse().join('/')} • ${escapeHtml(surpresa.mensagem)}
        </p>
      </div>
      <div class="admin-item-actions">
        <button class="btn btn-small btn-primary" onclick="editSurpresa(${surpresa.id})">Editar</button>
        <button class="btn btn-small btn-outline" onclick="deleteSurpresa(${surpresa.id})">Deletar</button>
      </div>
    `;
    list.appendChild(item);
  });
}

function editSurpresa(id) {
  const surpresa = (window.__surpresasCache || []).find((item) => item.id === id);
  if (!surpresa) return;
  document.getElementById('surpresaIdInput').value = surpresa.id;
  document.getElementById('surpresaTituloInput').value = surpresa.titulo;
  document.getElementById('surpresaDataInput').value = surpresa.data;
  document.getElementById('surpresaMensagemInput').value = surpresa.mensagem;
  document.getElementById('surpresaFotoSelect').value = surpresa.foto_id || '';
  document.getElementById('surpresaCancelBtn').style.display = 'inline-block';
}

async function deleteSurpresa(id) {
  if (!confirm('Deseja remover esta surpresa?')) return;
  const result = await supabase.deleteSurpresa(id);
  showNotification(result ? 'Surpresa removida!' : 'Erro ao remover surpresa', result ? 'success' : 'error');
  if (result) await loadSurpresasSection();
}

async function setupBackupRestore() {
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');

  exportBtn?.addEventListener('click', async () => {
    exportBtn.disabled = true;
    exportBtn.textContent = 'Exportando...';
    const dados = await supabase.exportarDados();
    if (dados) {
      const filename = `site-romantico-backup-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(JSON.stringify(dados, null, 2), filename, 'application/json');
      showNotification('Backup exportado com sucesso!', 'success');
    } else {
      showNotification('Erro ao exportar backup', 'error');
    }
    exportBtn.disabled = false;
    exportBtn.textContent = 'Exportar JSON 📥';
  });

  importBtn?.addEventListener('click', () => importFile.click());

  importFile?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const dados = JSON.parse(event.target.result);
        if (!confirm('Tem certeza que deseja importar estes dados?')) return;
        const result = await supabase.importarDados(dados);
        showNotification(result ? 'Dados importados com sucesso!' : 'Erro ao importar dados', result ? 'success' : 'error');
      } catch (_error) {
        showNotification('Arquivo inválido', 'error');
      }
    };
    reader.readAsText(file);
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
