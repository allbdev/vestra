import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Vestra <onboarding@resend.dev>",
      to: email,
      subject: "Confirme seu e-mail - Vestra",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Bem-vindo ao Vestra!</h1>
          <p style="color: #666; font-size: 16px;">
            Obrigado por se cadastrar. Use o código de confirmação abaixo para concluir seu cadastro:
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center;">
            Este código expira em 5 minutos.
          </p>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">
            Se você não solicitou este código, ignore este e-mail.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Email service error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export function generateConfirmationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
