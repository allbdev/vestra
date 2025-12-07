import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/app/lib/db";
import { sendConfirmationEmail, generateConfirmationCode } from "@/app/lib/email";

interface RegisterRequest {
  name?: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password, password_confirmation } = body;

    // Validate required fields
    if (!email || !password || !password_confirmation) {
      return NextResponse.json(
        { error: "E-mail, senha e confirmação de senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de e-mail inválido" },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (password !== password_confirmation) {
      return NextResponse.json(
        { error: "As senhas não coincidem" },
        { status: 400 }
      );
    }

    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 8 caracteres" },
        { status: 400 }
      );
    }

    // Check if email is already in use
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 409 }
      );
    }

    // Generate confirmation code
    const code = generateConfirmationCode();

    // Hash password and store pending registration
    const hashedPassword = await bcrypt.hash(password, 12);

    // Delete any existing confirmation codes for this email
    await db.confirmationCode.deleteMany({
      where: { email: email.toLowerCase() },
    });

    // Store the confirmation code
    await db.confirmationCode.create({
      data: {
        email: email.toLowerCase(),
        code,
      },
    });

    // Send confirmation email
    const emailResult = await sendConfirmationEmail(email, code);

    if (!emailResult.success) {
      // Clean up the confirmation code if email fails
      await db.confirmationCode.deleteMany({
        where: { email: email.toLowerCase() },
      });

      return NextResponse.json(
        { error: "Falha ao enviar e-mail de confirmação. Tente novamente." },
        { status: 500 }
      );
    }

    // Store pending registration data in global memory (for demo - in production use Redis or DB)
    // @ts-expect-error - using global for demo purposes
    if (!global.pendingRegistrations) {
      // @ts-expect-error - using global for demo purposes
      global.pendingRegistrations = new Map();
    }
    // @ts-expect-error - using global for demo purposes
    global.pendingRegistrations.set(email.toLowerCase(), {
      name,
      email: email.toLowerCase(),
      hashedPassword,
    });

    return NextResponse.json(
      {
        message:
          "E-mail de confirmação enviado! Verifique sua caixa de entrada e insira o código de 6 dígitos para concluir o cadastro.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro inesperado" },
      { status: 500 }
    );
  }
}
