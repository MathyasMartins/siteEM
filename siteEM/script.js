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
const SUPABASE_ANON_KEY = 'sb_publishable_opUXm9zUpaOCm2A7cP_FTg_aZ4p0MHX';

const CLOUDINARY_CLOUD_NAME = 'ddbtzkw3a';
const CLOUDINARY_UPLOAD_PRESET = 'site-romantico-unsigned';

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
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
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
      if (!response.ok) throw new Error(`Erro ao atualizar config: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar config:', error);
      return null;
    }
  }

  // Buscar recadinhos
  async getRecadinhos(aprovadosApenas = true) {
    try {
      const filter = aprovadosApenas ? '?aprovado=eq.true' : '';
      const response = await fetch(
        `${this.url}/rest/v1/recadinhos${filter}&order=criado_em.desc`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) throw new Error(`Erro ao buscar recadinhos: ${response.status}`);
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
          headers: this.getHeaders(),
          body: JSON.stringify({
            autor: autor,
            mensagem: mensagem,
            aprovado: false
          })
        }
      );
      if (!response.ok) throw new Error(`Erro ao inserir recadinho: ${response.status}`);
      return await response.json();
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
      if (!response.ok) throw new Error(`Erro ao atualizar recadinho: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar recadinho:', error);
      return null;
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
  async insertFoto(url) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/fotos`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ url: url })
        }
      );
      if (!response.ok) throw new Error(`Erro ao inserir foto: ${response.status}`);
      return await response.json();
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
          headers: this.getHeaders(),
          body: JSON.stringify({
            titulo: titulo,
            data: data,
            mensagem: mensagem
          })
        }
      );
      if (!response.ok) throw new Error(`Erro ao inserir agenda: ${response.status}`);
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

  // Exportar todos os dados como JSON
  async exportarDados() {
    try {
      const config = await this.getConfig();
      const recadinhos = await this.getRecadinhos(false);
      const fotos = await this.getFotos();
      const agenda = await this.getAgenda();

      return {
        config,
        recadinhos,
        fotos,
        agenda,
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

      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
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
      return data.secure_url; // Retorna a URL segura da imagem
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return null;
    }
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
// GERENCIADOR DE AUTENTICAÇÃO (ADMIN)
// ============================================================================

class AdminAuth {
  constructor() {
    this.storageKey = 'admin_password_hash';
  }

  // Hash simples de senha (não é seguro para produção, apenas para demo)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para inteiro de 32 bits
    }
    return hash.toString();
  }

  // Definir senha
  setPassword(password) {
    const hash = this.hashPassword(password);
    localStorage.setItem(this.storageKey, hash);
    localStorage.setItem('admin_logged_in', 'false');
  }

  // Verificar senha
  verifyPassword(password) {
    const hash = this.hashPassword(password);
    const storedHash = localStorage.getItem(this.storageKey);
    return hash === storedHash;
  }

  // Login
  login(password) {
    if (this.verifyPassword(password)) {
      localStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('admin_login_time', Date.now().toString());
      return true;
    }
    return false;
  }

  // Logout
  logout() {
    localStorage.setItem('admin_logged_in', 'false');
  }

  // Verificar se está logado
  isLoggedIn() {
    return localStorage.getItem('admin_logged_in') === 'true';
  }

  // Verificar se senha foi definida
  isPasswordSet() {
    return localStorage.getItem(this.storageKey) !== null;
  }
}

// ============================================================================
// INICIALIZAR INSTÂNCIAS GLOBAIS
// ============================================================================

const supabase = new SupabaseAPI(SUPABASE_URL, SUPABASE_ANON_KEY);
const cloudinary = new CloudinaryAPI(CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET);
const themeManager = new ThemeManager();
const adminAuth = new AdminAuth();

// ============================================================================
// SERVICE WORKER REGISTRATION (PWA)
// ============================================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('Service Worker registrado:', registration))
      .catch(error => console.log('Erro ao registrar Service Worker:', error));
  });
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
