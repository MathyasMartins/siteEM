import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

type NotificacaoPayload = {
  id: string;
  tipo: string;
  mensagem: string;
  autor_email: string | null;
  destino_email: string | null;
  created_at: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { notificacao } = await req.json() as { notificacao: NotificacaoPayload };
    if (!notificacao?.id) {
      return new Response(JSON.stringify({ error: 'notificacao inválida' }), { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');
    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'notificacoes@siteem.local';

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: usuarios, error: usuariosError } = await admin
      .from('usuarios')
      .select('email')
      .not('email', 'is', null);

    if (usuariosError) throw usuariosError;

    const destinatarios = (usuarios || [])
      .map((user) => user.email as string)
      .filter((email) => email && email !== notificacao.autor_email);

    if (resendApiKey && destinatarios.length > 0) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: emailFrom,
          to: destinatarios,
          subject: `Nova notificação: ${notificacao.tipo}`,
          html: `
            <h2>Nova notificação no SiteEM</h2>
            <p><strong>Tipo:</strong> ${notificacao.tipo}</p>
            <p><strong>Autor:</strong> ${notificacao.autor_email || 'Sistema'}</p>
            <p><strong>Data:</strong> ${new Date(notificacao.created_at).toLocaleString('pt-BR')}</p>
            <p><strong>Mensagem:</strong> ${notificacao.mensagem}</p>
          `
        })
      });
    }

    if (oneSignalApiKey && oneSignalAppId && destinatarios.length > 0) {
      await fetch('https://api.onesignal.com/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${oneSignalApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app_id: oneSignalAppId,
          included_segments: ['Subscribed Users'],
          headings: { en: 'Novo evento no SiteEM', pt: 'Novo evento no SiteEM' },
          contents: { en: notificacao.mensagem, pt: notificacao.mensagem },
          data: {
            notificationId: notificacao.id,
            tipo: notificacao.tipo
          }
        })
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
