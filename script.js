// ============================================================================
// SITE ROMÂNTICO - SCRIPT PRINCIPAL
// ============================================================================
// Este arquivo contém toda a lógica central, integração com Supabase e
// Cloudinary, e utilitários compartilhados por todas as páginas.
// ============================================================================
const SUPABASE_URL = 'https://rnwbazmklptnvjknlwsu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJud2Jhem1rbHB0bnZqa25sd3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTk2MzIsImV4cCI6MjA4MzkzNTYzMn0.I6KFmWtLmLkYvVqbaQt6BFSnx0BQt92Asjm_A5LGScI';
const CLOUDINARY_CLOUD_NAME = 'ddbtzkw3a';
const CLOUDINARY_UPLOAD_PRESET = 'site-romantico-unsigned';
// ============================================================================
// CLASSE: SupabaseAPI (REST)
// ============================================================================

class SupabaseAPI {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  getHeaders() {
    return {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      'Content-Type': 'application/json'
    };
  }

  async getConfig() {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/config?id=eq.1`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) throw new Error();
      const data = await response.json();
      return data[0] || null;
    } catch {
      return null;
    }
  }

  async updateConfig(updates) {
    const response = await fetch(
      `${this.url}/rest/v1/config?id=eq.1`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      }
    );
    return response.ok;
  }

  async getRecadinhos(aprovadosApenas = true) {
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

    if (!response.ok) return [];
    return await response.json();
  }

  async insertRecadinho(autor, mensagem) {
    const response = await fetch(
      `${this.url}/rest/v1/recadinhos`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          autor,
          mensagem,
          aprovado: false
        })
      }
    );

    return response.ok;
  }

  async updateRecadinho(id, updates) {
    const response = await fetch(
      `${this.url}/rest/v1/recadinhos?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      }
    );

    return response.ok;
  }

  async deleteRecadinho(id) {
    const response = await fetch(
      `${this.url}/rest/v1/recadinhos?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    );

    return response.ok;
  }

  async getFotos() {
    const response = await fetch(
      `${this.url}/rest/v1/fotos?order=criado_em.desc`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) return [];
    return await response.json();
  }

  async insertFoto(url) {
    const response = await fetch(
      `${this.url}/rest/v1/fotos`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ url })
      }
    );

    return response.ok;
  }

  async deleteFoto(id) {
    const response = await fetch(
      `${this.url}/rest/v1/fotos?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    );

    return response.ok;
  }

  async getAgenda() {
    const response = await fetch(
      `${this.url}/rest/v1/agenda?order=data.asc`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) return [];
    return await response.json();
  }

  async insertAgenda(titulo, data, mensagem) {
    const response = await fetch(
      `${this.url}/rest/v1/agenda`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ titulo, data, mensagem })
      }
    );

    return response.ok;
  }

  async deleteAgenda(id) {
    const response = await fetch(
      `${this.url}/rest/v1/agenda?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    );

    return response.ok;
  }
}


// ============================================================================
// CLOUDINARY
// ============================================================================

class CloudinaryAPI {
  constructor(cloudName, uploadPreset) {
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    this.uploadPreset = uploadPreset;
  }

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const response = await fetch(this.uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.secure_url;
  }
}


// ============================================================================
// THEME MANAGER
// ============================================================================

class ThemeManager {
  constructor() {
    this.isDark = localStorage.getItem('theme_dark') === 'true';
    this.applyTheme();
  }

  applyTheme() {
    const html = document.documentElement;
    this.isDark ? html.classList.add('dark') : html.classList.remove('dark');
  }

  toggle() {
    this.isDark = !this.isDark;
    localStorage.setItem('theme_dark', this.isDark);
    this.applyTheme();
  }
}


// ============================================================================
// INSTÂNCIAS GLOBAIS
// ============================================================================

window.supabaseApi = new SupabaseAPI(SUPABASE_URL, SUPABASE_ANON_KEY);
window.cloudinary = new CloudinaryAPI(CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET);
window.themeManager = new ThemeManager();

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// ============================================================================
// PROTEÇÃO GLOBAL
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {

  const BASE_PATH = '/siteEM';
  const isLoginPage = window.location.pathname.includes('login.html');

  const { data } = await supabaseClient.auth.getSession();
  const session = data.session;

  if (!session && !isLoginPage) {
    window.location.replace(`${BASE_PATH}/login.html`);
    return;
  }

  if (session && isLoginPage) {
    window.location.replace(`${BASE_PATH}/index.html`);
    return;
  }

  const authLoading = document.getElementById('authLoading');
  if (authLoading) authLoading.remove();
});


// Logout global
document.addEventListener('click', async (e) => {
  if (e.target.id === 'logoutBtn') {
    await supabaseClient.auth.signOut();
    window.location.replace('/siteEM/login.html');
  }
});


// ============================================================================
// SERVICE WORKER
// ============================================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}