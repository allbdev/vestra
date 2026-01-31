"use server";

import { db } from "@/app/lib/db";
import { sendPasswordResetEmail } from "@/app/lib/email";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import * as yup from "yup";

const requestResetSchema = yup.object({
    email: yup
        .string()
        .email("Formato de e-mail inválido")
        .required("E-mail é obrigatório"),
});

export interface RequestResetFormState {
    errors?: {
        email?: string[];
        _form?: string[];
    };
    message?: string;
    success?: boolean;
}

export async function requestPasswordReset(
    _prevState: RequestResetFormState | undefined,
    formData: FormData
): Promise<RequestResetFormState> {
    const email = formData.get("email") as string;

    try {
        await requestResetSchema.validate({ email }, { abortEarly: false });
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            const fieldErrors: Record<string, string[]> = {};
            error.inner.forEach((err) => {
                if (err.path) {
                    if (!fieldErrors[err.path]) {
                        fieldErrors[err.path] = [];
                    }
                    fieldErrors[err.path].push(err.message);
                }
            });
            return { errors: fieldErrors };
        }
        return { errors: { _form: ["Erro de validação"] } };
    }

    try {
        const user = await db.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        // If user not found, return error
        if (!user) {
            return {
                errors: {
                    email: ["Este e-mail não está cadastrado."],
                },
            };
        };

        // Generate token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        // Save token to DB
        // First, delete any existing tokens for this email to keep it clean
        await db.passwordResetToken.deleteMany({
            where: { email: email.toLowerCase() },
        });

        await db.passwordResetToken.create({
            data: {
                email: email.toLowerCase(),
                token,
                expiresAt,
            },
        });

        // Send email
        const emailResult = await sendPasswordResetEmail(email, token);

        if (!emailResult.success) {
            return {
                errors: {
                    _form: ["Falha ao enviar e-mail. Tente novamente mais tarde."],
                },
            };
        }

        return {
            success: true,
            message: "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
        };
    } catch (error) {
        console.error("Request password reset error:", error);
        return {
            errors: {
                _form: ["Ocorreu um erro inesperado"],
            },
        };
    }
}

const resetPasswordSchema = yup.object({
    password: yup
        .string()
        .min(8, "A senha deve ter pelo menos 8 caracteres")
        .required("Senha é obrigatória"),
    password_confirmation: yup
        .string()
        .oneOf([yup.ref("password")], "As senhas não coincidem")
        .required("Confirmação de senha é obrigatória"),
    token: yup.string().required("Token é obrigatório"),
});

export interface ResetPasswordFormState {
    errors?: {
        password?: string[];
        password_confirmation?: string[];
        _form?: string[];
    };
    message?: string;
    success?: boolean;
}

export async function resetPassword(
    _prevState: ResetPasswordFormState | undefined,
    formData: FormData
): Promise<ResetPasswordFormState> {
    const password = formData.get("password") as string;
    const password_confirmation = formData.get("password_confirmation") as string;
    const token = formData.get("token") as string;

    try {
        await resetPasswordSchema.validate(
            { password, password_confirmation, token },
            { abortEarly: false }
        );
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            const fieldErrors: Record<string, string[]> = {};
            error.inner.forEach((err) => {
                if (err.path) {
                    if (!fieldErrors[err.path]) {
                        fieldErrors[err.path] = [];
                    }
                    fieldErrors[err.path].push(err.message);
                }
            });
            return { errors: fieldErrors };
        }
        return { errors: { _form: ["Erro de validação"] } };
    }

    try {
        // Find token
        const storedToken = await db.passwordResetToken.findUnique({
            where: { token },
        });

        if (!storedToken) {
            return {
                errors: {
                    _form: ["Link inválido ou expirado. Solicite uma nova redefinição de senha."],
                },
            };
        }

        // Check expiry
        if (storedToken.expiresAt < new Date()) {
            await db.passwordResetToken.delete({ where: { id: storedToken.id } });
            return {
                errors: {
                    _form: ["Link expirado. Solicite uma nova redefinição de senha."],
                },
            };
        }

        // Find user
        const user = await db.user.findUnique({
            where: { email: storedToken.email },
        });

        if (!user) {
            // Should not happen if foreign keys were enforced or logic is sound, but good safety
            return {
                errors: {
                    _form: ["Usuário não encontrado."],
                },
            };
        }

        // Update password
        const hashedPassword = await bcrypt.hash(password, 12);

        await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        // Delete token
        await db.passwordResetToken.delete({ where: { id: storedToken.id } });

        // We can't redirect directly inside a try-catch block if we want to return state, 
        // but here we want to redirect on success.
        // However, pattern with useActionState often prefers returning success state 
        // and letting client handle redirect or showing success message.
        // Let's return success true and let the client component redirect or show a "Go to login" button.

        return {
            success: true,
            message: "Senha redefinida com sucesso! Você pode fazer login agora.",
        };

    } catch (error) {
        console.error("Reset password error:", error);
        return {
            errors: {
                _form: ["Ocorreu um erro inesperado"],
            },
        };
    }
}
