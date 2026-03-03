const supabase = window.supabase.createClient(
  "SUA_SUPABASE_URL",
  "SUA_SUPABASE_ANON_KEY"
);

async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "/login.html";
    return;
  }

  // Só mostra a página depois da verificação
  document.body.style.display = "block";
}

// Escuta logout automático
supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    window.location.href = "/login.html";
  }
});

// Deixa função global
window.requireAuth = requireAuth;