// ============================================================================
// SITE ROMÂNTICO - SCRIPT PRINCIPAL
// ============================================================================
// Este arquivo contém toda a lógica central, integração com Supabase e
// Cloudinary, e utilitários compartilhados por todas as páginas.
// ============================================================================

// ============================================================================
// CONFIGURAÇÃO - EDITE AQUI COM SEUS VALORES
// ============================================================================

const SUPABASE_URL = 'https://rnwbazmklptnvjknlwsu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJud2Jhem1rbHB0bnZqa25sd3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTk2MzIsImV4cCI6MjA4MzkzNTYzMn0.I6KFmWtLmLkYvVqbaQt6BFSnx0BQt92Asjm_A5LGScI';
const CLOUDINARY_CLOUD_NAME = 'ddbtzkw3a';
const CLOUDINARY_UPLOAD_PRESET = 'site-romantico-unsigned';
const ONE_SIGNAL_APP_ID = '2b57737b-ddcc-4a31-867e-ea7aaa92dc03';

// ============================================================================
// CLASSE: SupabaseAPI
// Gerencia todas as operações com o Supabase
// ============================================================================

class SupabaseAPI {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  // Headers padrão para requisições
  getHeaders() {
    const token = authManager?.getAccessToken?.();
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${token || this.key}`,
      'Content-Type': 'application/json'
    };
  }

  // Buscar configurações
  async getConfig() {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/config?id=eq.1`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) throw new Error(`Erro ao buscar config: ${response.status}`);
      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('Erro ao buscar config:', error);
      return null;
    }
  }
  // Atualizar configurações
  async updateConfig(updates) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/config?id=eq.1`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao atualizar config: ${response.status}`);
      }
      return true;

    } catch (error) {
      console.error('Erro ao atualizar config:', error);
      return false;
    }
  }
  // Buscar recadinhos
  async getRecadinhos(aprovadosApenas = true) {
    try {
      let url = `${this.url}/rest/v1/recadinhos`;

      const params = new URLSearchParams();

      if (aprovadosApenas) {
        params.append('aprovado', 'eq.true');
      }

      params.append('order', 'criado_em.desc');

      url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar recadinhos: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar recadinhos:', error);
      return [];
    }
  }

  // Inserir recadinho
  async insertRecadinho(autor, mensagem) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/recadinhos`,
        {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            autor: autor,
            mensagem: mensagem,
            aprovado: true
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao inserir recadinho: ${response.status}`);
      }

      const data = await response.json();
      return data[0] || null;

    } catch (error) {
      console.error('Erro ao inserir recadinho:', error);
      return null;
    }
  }

  // Atualizar recadinho
  async updateRecadinho(id, updates) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/recadinhos?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao atualizar recadinho: ${response.status}`);
      }
      return true;

    } catch (error) {
      console.error('Erro ao atualizar recadinho:', error);
      return false;
    }
  }

  // Deletar recadinho
  async deleteRecadinho(id) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/recadinhos?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: this.getHeaders()
        }
      );
      if (!response.ok) throw new Error(`Erro ao deletar recadinho: ${response.status}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar recadinho:', error);
      return false;
    }
  }

  // Buscar fotos
  async getFotos() {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/fotos?order=criado_em.desc`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) throw new Error(`Erro ao buscar fotos: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar fotos:', error);
      return [];
    }
  }

  // Inserir foto
  async insertFoto(url, publicId = null) {
    try {
      const payload = { url: url };
      if (publicId) {
        payload.public_id = publicId;
      }

      let response = await fetch(
        `${this.url}/rest/v1/fotos`,
        {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(payload)
        }
      );

      // Compatibilidade com schemas antigos sem a coluna `public_id`
      if (!response.ok && publicId) {
        const responseText = await response.text();
        const missingPublicIdColumn = responseText.includes('public_id') && responseText.includes('column');

        if (response.status === 400 && missingPublicIdColumn) {
          response = await fetch(
            `${this.url}/rest/v1/fotos`,
            {
              method: 'POST',
              headers: {
                ...this.getHeaders(),
                'Prefer': 'return=representation'
              },
              body: JSON.stringify({ url: url })
            }
          );
        }
      }

      if (!response.ok) {
        throw new Error(`Erro ao inserir foto: ${response.status}`);
      }

      const data = await response.json();
      return data[0] || null;

    } catch (error) {
      console.error('Erro ao inserir foto:', error);
      return null;
    }
  }

  // Deletar foto
  async deleteFoto(id) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/fotos?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: this.getHeaders()
        }
      );
      if (!response.ok) throw new Error(`Erro ao deletar foto: ${response.status}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      return false;
    }
  }

  async getFotoById(id) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/fotos?id=eq.${id}&select=*`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) throw new Error(`Erro ao buscar foto: ${response.status}`);
      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('Erro ao buscar foto por id:', error);
      return null;
    }
  }

  // Buscar agenda
  async getAgenda() {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/agenda?order=data.asc`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) throw new Error(`Erro ao buscar agenda: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar agenda:', error);
      return [];
    }
  }
  // Inserir evento na agenda
  async insertAgenda(titulo, data, mensagem) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/agenda`,
        {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            titulo: titulo,
            data: data,
            mensagem: mensagem
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao inserir agenda: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Erro ao inserir agenda:', error);
      return null;
    }
  }

  // Deletar evento da agenda
  async deleteAgenda(id) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/agenda?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: this.getHeaders()
        }
      );
      if (!response.ok) throw new Error(`Erro ao deletar agenda: ${response.status}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar agenda:', error);
      return false;
    }
  }

  async getUsuarioByEmail(email) {
    if (!email) return null;
    try {
      const response = await fetch(
        `${this.url}/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}&order=created_at.asc&limit=1`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) throw new Error(`Erro ao buscar perfil: ${response.status}`);
      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('Erro ao buscar perfil por email:', error);
      return null;
    }
  }

  async insertUsuario(payload) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/usuarios`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        }
      );
      if (!response.ok) throw new Error(`Erro ao inserir perfil: ${response.status}`);
      return true;
    } catch (error) {
      console.error('Erro ao inserir perfil:', error);
      return false;
    }
  }

  async updateUsuarioByEmail(email, updates) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(updates)
        }
      );
      if (!response.ok) throw new Error(`Erro ao atualizar perfil: ${response.status}`);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  }

  async getUsuariosEmails() {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/usuarios?select=email`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) throw new Error(`Erro ao buscar emails dos usuários: ${response.status}`);
      const data = await response.json();
      return data.map((item) => item.email).filter(Boolean);
    } catch (error) {
      console.error('Erro ao buscar emails dos usuários:', error);
      return [];
    }
  }

  async createNotification(payload) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/notificacoes`,
        {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao criar notificação: ${response.status}`);
      }

      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return null;
    }
  }

  // Exportar todos os dados como JSON
  async exportarDados() {
    try {
      const config = await this.getConfig();
      const recadinhos = await this.getRecadinhos(false);
      const fotos = await this.getFotos();
      const agenda = await this.getAgenda();
      const surpresas = await this.getSurpresas();

      return {
        config,
        recadinhos,
        fotos,
        agenda,
        surpresas,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return null;
    }
  }

  // Importar dados do JSON
  async importarDados(dados) {
    try {
      // Atualizar config
      if (dados.config) {
        await this.updateConfig(dados.config);
      }

      // Inserir recadinhos
      if (dados.recadinhos && Array.isArray(dados.recadinhos)) {
        for (const recadinho of dados.recadinhos) {
          await this.insertRecadinho(recadinho.autor, recadinho.mensagem);
        }
      }

      // Inserir fotos
      if (dados.fotos && Array.isArray(dados.fotos)) {
        for (const foto of dados.fotos) {
          await this.insertFoto(foto.url);
        }
      }

      // Inserir agenda
      if (dados.agenda && Array.isArray(dados.agenda)) {
        for (const evento of dados.agenda) {
          await this.insertAgenda(evento.titulo, evento.data, evento.mensagem);
        }
      }

      if (dados.surpresas && Array.isArray(dados.surpresas)) {
        for (const surpresa of dados.surpresas) {
          await this.insertSurpresa({
            titulo: surpresa.titulo,
            data: surpresa.data,
            mensagem: surpresa.mensagem,
            foto_id: surpresa.foto_id || null,
            created_by: surpresa.created_by || null,
            created_by_email: surpresa.created_by_email || null
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }

  async getSurpresas() {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/surpresas?order=data.asc`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) throw new Error(`Erro ao buscar surpresas: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar surpresas:', error);
      return [];
    }
  }

  async insertSurpresa(payload) {
    try {
      const response = await fetch(`${this.url}/rest/v1/surpresas`, {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Erro ao inserir surpresa: ${response.status}`);
      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('Erro ao inserir surpresa:', error);
      return null;
    }
  }

  async updateSurpresa(id, payload) {
    try {
      const response = await fetch(`${this.url}/rest/v1/surpresas?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Erro ao atualizar surpresa: ${response.status}`);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar surpresa:', error);
      return false;
    }
  }

  async deleteSurpresa(id) {
    try {
      const response = await fetch(`${this.url}/rest/v1/surpresas?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (!response.ok) throw new Error(`Erro ao deletar surpresa: ${response.status}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar surpresa:', error);
      return false;
    }
  }
}

// ============================================================================
// CLASSE: CloudinaryAPI
// Gerencia upload de imagens para o Cloudinary
// ============================================================================

class CloudinaryAPI {
  constructor(cloudName, uploadPreset) {
    this.cloudName = cloudName;
    this.uploadPreset = uploadPreset;
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  }

  // Upload de imagem
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);

      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error(`Erro ao fazer upload: ${response.status}`);

      const data = await response.json();
      return {
        secureUrl: data.secure_url,
        publicId: data.public_id || null
      };
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return null;
    }
  }

  async deleteImage(publicId) {
    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
      });
      if (!response.ok) throw new Error(`Erro ao deletar no Cloudinary: ${response.status}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar no Cloudinary:', error);
      return false;
    }
  }
}

class AuthManager {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.sessionKey = 'supabase_auth_session';
    this.userKey = 'supabase_auth_user';
    this.profileKey = 'supabase_user_profile';
  }

  getStoredSession() {
    const raw = sessionStorage.getItem(this.sessionKey);
    return raw ? JSON.parse(raw) : null;
  }

  getUser() {
    const raw = sessionStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  getProfile() {
    const raw = sessionStorage.getItem(this.profileKey);
    return raw ? JSON.parse(raw) : null;
  }

  getDisplayName() {
    const profile = this.getProfile();
    const user = this.getUser();
    return profile?.apelido || profile?.nome || user?.email || 'Usuário';
  }

  getAccessToken() {
    return this.getStoredSession()?.access_token || null;
  }

  saveSession(data) {
    if (!data?.access_token) return;
    sessionStorage.setItem(this.sessionKey, JSON.stringify(data));
    if (data.user) {
      sessionStorage.setItem(this.userKey, JSON.stringify(data.user));
    }
  }

  saveProfile(profile) {
    if (!profile) return;
    sessionStorage.setItem(this.profileKey, JSON.stringify(profile));
  }

  async ensureProfile() {
    const user = this.getUser();
    const email = user?.email;
    if (!email) return null;

    let profile = await supabaseApi.getUsuarioByEmail(email);

    if (!profile) {
      const defaultName = email.split('@')[0] || 'Usuário';
      const inserted = await supabaseApi.insertUsuario({
        email,
        nome: defaultName,
        apelido: defaultName,
        url_imagem: null
      });
      if (!inserted) return null;
      profile = await supabaseApi.getUsuarioByEmail(email);
    }

    if (profile) this.saveProfile(profile);
    return profile;
  }

  async updateProfile(updates) {
    const user = this.getUser();
    const email = user?.email;
    if (!email) return false;

    const ok = await supabaseApi.updateUsuarioByEmail(email, updates);
    if (!ok) return false;

    await this.ensureProfile();
    return true;
  }

  async login(email, password) {
    const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: this.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) return null;
    const data = await response.json();
    this.saveSession(data);
    await this.ensureProfile();
    return data;
  }

  async signUp(email, password) {
    const response = await fetch(`${this.url}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        apikey: this.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) return null;
    return await response.json();
  }

  logout() {
    sessionStorage.removeItem(this.sessionKey);
    sessionStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.profileKey);
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

class OneSignalManager {
  constructor() {
    this.ready = false;
    this.lastNotified = new Set();
  }

  getBasePath() {
    const isGithubPages = window.location.hostname.endsWith('github.io');
    const projectPath = window.location.pathname.split('/').filter(Boolean)[0] || '';
    return isGithubPages && projectPath ? `/${projectPath}` : '';
  }

  async init() {
    if (!window.OneSignalDeferred) window.OneSignalDeferred = [];

    const basePath = this.getBasePath();
    const workerPath = `${basePath}/OneSignalSDK.sw.js`;
    const updaterWorkerPath = `${basePath}/OneSignalSDKUpdaterWorker.js`;
    const workerScope = `${basePath}/`;

    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.init({
          appId: ONE_SIGNAL_APP_ID,
          serviceWorkerPath: workerPath,
          serviceWorkerUpdaterPath: updaterWorkerPath,
          path: workerScope,
          serviceWorkerParam: { scope: workerScope },
          notifyButton: { enable: true },
          allowLocalhostAsSecureOrigin: true
        });
        this.ready = true;
        const user = authManager.getUser();
        if (user?.id) {
          await OneSignal.login(user.id);
        }
      } catch (error) {
        this.ready = false;
        console.warn('OneSignal indisponível no momento. Notificações push foram desativadas sem impactar o restante do app.', error);
      }
    });
  }

  notifyOnce(key, title, message) {
    if (this.lastNotified.has(key)) return;
    this.lastNotified.add(key);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
    showNotification(`${title} — ${message}`, 'info');
  }
}

class NotificationManager {
  constructor() {
    this.channel = null;
    this.realtimeClient = null;
  }

  async getRecipientEmails(authorEmail) {
    const emails = await supabaseApi.getUsuariosEmails();
    const unique = [...new Set(emails)];
    return unique.filter((email) => email && email !== authorEmail);
  }

  async createNotification({ tipo, mensagem, autorEmail, referenciaId = null }) {
    const recipients = await this.getRecipientEmails(autorEmail);

    if (recipients.length === 0) {
      const notification = await supabaseApi.createNotification({
        tipo,
        mensagem,
        autor_email: autorEmail,
        destino_email: null,
        referencia_id: referenciaId ? String(referenciaId) : null,
        lida: false
      });

      if (notification) {
        this.triggerDelivery(notification).catch(() => null);
      }
      return [notification].filter(Boolean);
    }

    const inserted = [];
    for (const destinoEmail of recipients) {
      const notification = await supabaseApi.createNotification({
        tipo,
        mensagem,
        autor_email: autorEmail,
        destino_email: destinoEmail,
        referencia_id: referenciaId ? String(referenciaId) : null,
        lida: false
      });

      if (notification) {
        inserted.push(notification);
        this.triggerDelivery(notification).catch(() => null);
      }
    }

    return inserted;
  }

  async triggerDelivery(notification) {
    const token = authManager.getAccessToken();
    await fetch(`${SUPABASE_URL}/functions/v1/notificacoes-dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ notificacao: notification })
    });
  }

  initRealtime() {
    if (!window.supabase?.createClient || this.channel) return;

    this.realtimeClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const currentUserEmail = authManager.getUser()?.email;

    this.channel = this.realtimeClient
      .channel('notificacoes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificacoes' },
        (payload) => {
          const data = payload.new;
          const isOwn = data.autor_email && data.autor_email === currentUserEmail;
          const isTarget = !data.destino_email || data.destino_email === currentUserEmail;

          if (!isOwn && isTarget) {
            showNotification(data.mensagem, 'info');
          }
        }
      )
      .subscribe();
  }
}

// ============================================================================
// UTILITÁRIOS DE DATA E HORA
// ============================================================================

class DateUtils {
  // Calcular diferença entre duas datas
  static calculateDifference(startDate, endDate = new Date()) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }

  // Formatar diferença de tempo para texto
  static formatDifference(days, hours, minutes) {
    const parts = [];
    if (days > 0) parts.push(`${days} dia${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hora${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`);
    return parts.join(', ') || '0 minutos';
  }

  // Formatar data para padrão brasileiro
  static formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Converter data para formato ISO (YYYY-MM-DD)
  static toISODate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}

// ============================================================================
// GERENCIADOR DE TEMA (MODO NOTURNO)
// ============================================================================

class ThemeManager {
  constructor() {
    this.isDark = localStorage.getItem('theme_dark') === 'true';
    this.applyTheme();
  }

  // Aplicar tema
  applyTheme() {
    const html = document.documentElement;
    if (this.isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  // Alternar tema
  toggle() {
    this.isDark = !this.isDark;
    localStorage.setItem('theme_dark', this.isDark);
    this.applyTheme();
    return this.isDark;
  }

  // Obter tema atual
  isDarkMode() {
    return this.isDark;
  }
}

// ============================================================================
// AUTENTICAÇÃO (SUPABASE AUTH)
// ============================================================================

// ============================================================================
// INICIALIZAR INSTÂNCIAS GLOBAIS
// ============================================================================

const supabaseApi = new SupabaseAPI(SUPABASE_URL, SUPABASE_ANON_KEY);
const cloudinary = new CloudinaryAPI(CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET);
const themeManager = new ThemeManager();
const authManager = new AuthManager(SUPABASE_URL, SUPABASE_ANON_KEY);
const oneSignalManager = new OneSignalManager();
const notificationManager = new NotificationManager();

// ============================================================================
// SERVICE WORKER REGISTRATION (PWA)
// ============================================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const basePath = oneSignalManager.getBasePath();
    navigator.serviceWorker.register(`${basePath}/sw.js`)
      .then(registration => console.log('Service Worker registrado:', registration))
      .catch(error => console.log('Erro ao registrar Service Worker:', error));
  });
}

if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission().catch(() => null);
}

oneSignalManager.init();
notificationManager.initRealtime();

function ensureAuthenticated() {
  const onLoginPage = window.location.pathname.endsWith('login.html');
  if (!authManager.isAuthenticated() && !onLoginPage) {
    window.location.href = 'login.html';
    return false;
  }
  if (authManager.isAuthenticated() && onLoginPage) {
    window.location.href = 'index.html';
    return false;
  }

  if (authManager.isAuthenticated()) {
    authManager.ensureProfile().catch(() => null);
  }

  return true;
}

// ============================================================================
// FUNÇÕES AUXILIARES GLOBAIS
// ============================================================================

// Mostrar notificação
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Remover após 3 segundos
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Validar email
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validar data
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Formatar moeda
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Copiar para clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showNotification('Copiado para a área de transferência!', 'success'))
    .catch(() => showNotification('Erro ao copiar', 'error'));
}

// Download de arquivo
function downloadFile(content, filename, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// FIM DO SCRIPT
// ============================================================================
