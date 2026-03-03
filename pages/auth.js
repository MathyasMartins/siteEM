const SUPABASE_URL = 'https://rnwbazmklptnvjknlwsu.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';

// const supabase = window.supabase.createClient(
//   SUPABASE_URL,
//   SUPABASE_ANON_KEY
// );

async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "login.html"; // retire a barra /
    return;
  }

  document.body.style.display = "block";
}

supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    window.location.href = "login.html"; // retire a barra /
  }
});

window.requireAuth = requireAuth;