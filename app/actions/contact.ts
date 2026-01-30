"use server";

import { db } from "@/app/lib/db";
import { Resend } from "resend";
import * as yup from "yup";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = yup.object({
    name: yup.string().required("Nome é obrigatório"),
    email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
    phone: yup.string().optional(),
    message: yup.string().required("Mensagem é obrigatória"),
});

export async function submitContactForm(data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
}) {
    try {
        const validatedData = await contactSchema.validate(data);

        // Save to database
        await db.message.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                phone: validatedData.phone || null,
                message: validatedData.message,
            },
        });

        // Send email
        if (process.env.EMAIL_TO) {
            await resend.emails.send({
                from: process.env.EMAIL_FROM || "Vestra <no-reply@vestra-financas.com.br>",
                to: process.env.EMAIL_TO,
                subject: `Nova mensagem de contato de ${validatedData.name}`,
                html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Nova mensagem recebida</h2>
            <p><strong>Nome:</strong> ${validatedData.name}</p>
            <p><strong>E-mail:</strong> ${validatedData.email}</p>
            <p><strong>Telefone:</strong> ${validatedData.phone || "Não informado"}</p>
            <p><strong>Mensagem:</strong></p>
            <p style="white-space: pre-wrap; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${validatedData.message}</p>
          </div>
        `,
            });
        }

        return { success: true };
    } catch (error: unknown) {
        console.error("Error submitting contact form:", error);
        return { success: false, error: "Erro ao enviar mensagem. Tente novamente." };
    }
}
