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

// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ============================================================================
// PROTEÇÃO GLOBAL DO SITE
// ============================================================================

async function checkAuth() {
  const { data } = await supabaseClient.auth.getSession();
  const loading = document.getElementById('authLoading');

  if (!data.session) {
    window.location.href = 'login.html';
  } else {
    if (loading) loading.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabaseClient.auth.signOut();
      window.location.href = 'login.html';
    });
  }
});

supabaseClient.auth.onAuthStateChange((_event, session) => {
  if (!session) {
    window.location.href = 'login.html';
  }
});

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
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
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
    } catch (error) {
      console.error(error);
      return null;
    }
  }

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
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

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

      if (!response.ok) throw new Error();
      return await response.json();

    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async insertRecadinho(autor, mensagem) {
    try {
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

    } catch (error) {
      console.error(error);
      return false;
    }
  }

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

      return response.ok;

    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async deleteRecadinho(id) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/recadinhos?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: this.getHeaders()
        }
      );

      return response.ok;

    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getFotos() {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/fotos?order=criado_em.desc`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) throw new Error();
      return await response.json();

    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async insertFoto(url) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/fotos`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ url })
        }
      );

      return response.ok;

    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async deleteFoto(id) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/fotos?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: this.getHeaders()
        }
      );

      return response.ok;

    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getAgenda() {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/agenda?order=data.asc`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) throw new Error();
      return await response.json();

    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async insertAgenda(titulo, data, mensagem) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/agenda`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ titulo, data, mensagem })
        }
      );

      return response.ok;

    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async deleteAgenda(id) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/agenda?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: this.getHeaders()
        }
      );

      return response.ok;

    } catch (error) {
      console.error(error);
      return false;
    }
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
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);

      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      return data.secure_url;

    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

// ============================================================================
// INSTÂNCIAS GLOBAIS
// ============================================================================

const supabase = new SupabaseAPI(SUPABASE_URL, SUPABASE_ANON_KEY);
const cloudinary = new CloudinaryAPI(CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET);

// ============================================================================
// UTILITÁRIOS
// ============================================================================

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showNotification('Copiado para a área de transferência!', 'success'))
    .catch(() => showNotification('Erro ao copiar', 'error'));
}

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

async function checkAuth() {
  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.href = './login.html';
  }
}

document.addEventListener('DOMContentLoaded', async () => {

  const BASE_PATH = '/siteEM';

  const isLoginPage = window.location.pathname.includes('login.html');

  const { data: { session } } = await supabaseClient.auth.getSession();

  // 🔒 Se NÃO estiver logado e NÃO for a página de login → manda para login
  if (!session && !isLoginPage) {
    window.location.replace(`${BASE_PATH}/login.html`);
    return;
  }

  // 🔁 Se estiver logado e tentar acessar login → manda para index
  if (session && isLoginPage) {
    window.location.replace(`${BASE_PATH}/index.html`);
    return;
  }

});

// 🔄 Se deslogar em qualquer momento → volta para login
supabaseClient.auth.onAuthStateChange((_event, session) => {

  const BASE_PATH = '/siteEM';
  const isLoginPage = window.location.pathname.includes('login.html');

  if (!session && !isLoginPage) {
    window.location.replace(`${BASE_PATH}/login.html`);
  }

});
// ============================================================================
// SERVICE WORKER REGISTRATION (PWA)
// ============================================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => console.log('Service Worker registrado:', registration))
      .catch(error => console.log('Erro ao registrar Service Worker:', error));
  });
}