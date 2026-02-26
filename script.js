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

// ============================================================================
// CLASSE: SupabaseAPI (REVISADA)
// ============================================================================

class SupabaseAPI {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  getHeaders() {
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json'
    };
  }

  async fetchJSON(url, options = {}) {
    try {
      const response = await fetch(url, { headers: this.getHeaders(), ...options });
      if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Erro na requisição:', error);
      return null;
    }
  }

  // ==================== CONFIG ====================

  async getConfig() {
    const url = new URL(`${this.url}/rest/v1/config`);
    url.searchParams.append('id', 'eq.1');
    return (await this.fetchJSON(url.toString()))?.[0] || null;
  }

  async updateConfig(updates) {
    const url = new URL(`${this.url}/rest/v1/config`);
    url.searchParams.append('id', 'eq.1');
    return this.fetchJSON(url.toString(), { method: 'PATCH', body: JSON.stringify(updates) });
  }

  // ==================== RECADINHOS ====================

  async getRecadinhos(aprovadosApenas = true) {
    const url = new URL(`${this.url}/rest/v1/recadinhos`);
    if (aprovadosApenas) url.searchParams.append('aprovado', 'eq.true');
    url.searchParams.append('order', 'criado_em.desc');
    return this.fetchJSON(url.toString()) || [];
  }

  async insertRecadinho(autor, mensagem) {
    return this.fetchJSON(`${this.url}/rest/v1/recadinhos`, {
      method: 'POST',
      body: JSON.stringify({ autor, mensagem, aprovado: false })
    });
  }

  async updateRecadinho(id, updates) {
    const url = new URL(`${this.url}/rest/v1/recadinhos`);
    url.searchParams.append('id', `eq.${id}`);
    return this.fetchJSON(url.toString(), { method: 'PATCH', body: JSON.stringify(updates) });
  }

  async deleteRecadinho(id) {
    const url = new URL(`${this.url}/rest/v1/recadinhos`);
    url.searchParams.append('id', `eq.${id}`);
    const result = await this.fetchJSON(url.toString(), { method: 'DELETE' });
    return result !== null;
  }

  // ==================== FOTOS ====================

  async getFotos() {
    const url = new URL(`${this.url}/rest/v1/fotos`);
    url.searchParams.append('order', 'criado_em.desc');
    return this.fetchJSON(url.toString()) || [];
  }

  async insertFoto(urlFoto) {
    return this.fetchJSON(`${this.url}/rest/v1/fotos`, {
      method: 'POST',
      body: JSON.stringify({ url: urlFoto })
    });
  }

  async deleteFoto(id) {
    const url = new URL(`${this.url}/rest/v1/fotos`);
    url.searchParams.append('id', `eq.${id}`);
    const result = await this.fetchJSON(url.toString(), { method: 'DELETE' });
    return result !== null;
  }

  // ==================== AGENDA ====================

  async getAgenda() {
    const url = new URL(`${this.url}/rest/v1/agenda`);
    url.searchParams.append('order', 'data.asc');
    return this.fetchJSON(url.toString()) || [];
  }

  async insertAgenda(titulo, data, mensagem) {
    return this.fetchJSON(`${this.url}/rest/v1/agenda`, {
      method: 'POST',
      body: JSON.stringify({ titulo, data, mensagem })
    });
  }

  async deleteAgenda(id) {
    const url = new URL(`${this.url}/rest/v1/agenda`);
    url.searchParams.append('id', `eq.${id}`);
    const result = await this.fetchJSON(url.toString(), { method: 'DELETE' });
    return result !== null;
  }

  // ==================== EXPORT / IMPORT ====================

  async exportarDados() {
    const config = await this.getConfig();
    const recadinhos = await this.getRecadinhos(false);
    const fotos = await this.getFotos();
    const agenda = await this.getAgenda();
    return { config, recadinhos, fotos, agenda, exportedAt: new Date().toISOString() };
  }

  async importarDados(dados) {
    try {
      if (dados.config) await this.updateConfig(dados.config);
      if (Array.isArray(dados.recadinhos)) {
        for (const r of dados.recadinhos) await this.insertRecadinho(r.autor, r.mensagem);
      }
      if (Array.isArray(dados.fotos)) {
        for (const f of dados.fotos) await this.insertFoto(f.url);
      }
      if (Array.isArray(dados.agenda)) {
        for (const a of dados.agenda) await this.insertAgenda(a.titulo, a.data, a.mensagem);
      }
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }
}

// ============================================================================
// CLASSE: CloudinaryAPI (mantida)
// ============================================================================

class CloudinaryAPI {
  constructor(cloudName, uploadPreset) {
    this.cloudName = cloudName;
    this.uploadPreset = uploadPreset;
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  }

  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      const response = await fetch(this.uploadUrl, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Erro ao fazer upload: ${response.status}`);
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return null;
    }
  }
}

// ============================================================================
// UTILITÁRIOS DE DATA E HORA, THEME, ADMINAUTH e FUNÇÕES GLOBAIS
// ============================================================================

// Mantidos como no seu código original (DateUtils, ThemeManager, AdminAuth, showNotification, etc.)

// ============================================================================
// INSTÂNCIAS GLOBAIS
// ============================================================================

const supabase = new SupabaseAPI(SUPABASE_URL, SUPABASE_ANON_KEY);
const cloudinary = new CloudinaryAPI(CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET);
const themeManager = new ThemeManager();
const adminAuth = new AdminAuth();

// ============================================================================
// SERVICE WORKER (GitHub Pages compatível)
// ============================================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrado:', reg))
      .catch(err => console.error('Erro ao registrar SW:', err));
  });
}