
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from "npm:@react-email/render@0.0.12";
import WelcomeEmail from "./templates/welcome.tsx";
import MagicLinkEmail from "./templates/magic-link.tsx";
import PasswordResetEmail from "./templates/password-reset.tsx";

const resend = new Resend("re_7QfCEobq_4y7z3ha195MtmHi6D1qPRYkV");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, data } = await req.json();

    let html = '';
    let subject = '';

    switch (type) {
      case 'welcome':
        html = await renderAsync(WelcomeEmail(data));
        subject = 'Bem-vindo ao NobugOKR';
        break;
      case 'magic-link':
        html = await renderAsync(MagicLinkEmail(data));
        subject = 'Link de Login para NobugOKR';
        break;
      case 'password-reset':
        html = await renderAsync(PasswordResetEmail(data));
        subject = 'Redefinição de Senha - NobugOKR';
        break;
      default:
        throw new Error('Tipo de e-mail inválido');
    }

    const result = await resend.emails.send({
      from: "NobugOKR <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
