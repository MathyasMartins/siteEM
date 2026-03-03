const SUPABASE_URL = 'https://rnwbazmklptnvjknlwsu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJud2Jhem1rbHB0bnZqa25sd3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTk2MzIsImV4cCI6MjA4MzkzNTYzMn0.I6KFmWtLmLkYvVqbaQt6BFSnx0BQt92Asjm_A5LGScI';


const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "/login.html";
    return false;
  }

  return true;
}

// Espera o DOM carregar
document.addEventListener("DOMContentLoaded", async () => {
  const isAuthenticated = await requireAuth();

  if (isAuthenticated) {
    document.body.style.display = "block";

    // 🔥 Só agora dispara evento dizendo que pode carregar dados
    window.dispatchEvent(new Event("authReady"));
  }
});

// Logout automático
supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    window.location.href = "/login.html";
  }
});

window.supabaseClient = supabase;