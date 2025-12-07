import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

interface ConfirmRequest {
  email: string;
  confirmation_code: string;
}

const CODE_EXPIRY_MINUTES = 5;

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmRequest = await request.json();
    const { email, confirmation_code } = body;

    // Validate required fields
    if (!email || !confirmation_code) {
      return NextResponse.json(
        { error: "E-mail e código de confirmação são obrigatórios" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Find the confirmation code
    const storedCode = await db.confirmationCode.findFirst({
      where: {
        email: normalizedEmail,
        code: confirmation_code,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!storedCode) {
      return NextResponse.json(
        { error: "Código de confirmação inválido" },
        { status: 400 }
      );
    }

    // Check if code is expired (5 minutes)
    const codeAge =
      (Date.now() - storedCode.createdAt.getTime()) / 1000 / 60; // in minutes

    if (codeAge > CODE_EXPIRY_MINUTES) {
      // Delete expired code
      await db.confirmationCode.delete({
        where: { id: storedCode.id },
      });

      return NextResponse.json(
        {
          error:
            "O código de confirmação expirou. Faça o cadastro novamente para receber um novo código.",
        },
        { status: 410 }
      );
    }

    // Get pending registration data
    // @ts-expect-error - using global for demo purposes
    const pendingData = global.pendingRegistrations?.get(normalizedEmail);

    if (!pendingData) {
      return NextResponse.json(
        {
          error:
            "Dados do cadastro não encontrados. Inicie o processo de cadastro novamente.",
        },
        { status: 400 }
      );
    }

    // Check if user already exists (race condition check)
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Clean up
      await db.confirmationCode.delete({
        where: { id: storedCode.id },
      });
      // @ts-expect-error - using global for demo purposes
      global.pendingRegistrations?.delete(normalizedEmail);

      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 409 }
      );
    }

    // Create the user
    const user = await db.user.create({
      data: {
        name: pendingData.name,
        email: normalizedEmail,
        password: pendingData.hashedPassword,
      },
    });

    // Clean up confirmation code and pending data
    await db.confirmationCode.delete({
      where: { id: storedCode.id },
    });
    // @ts-expect-error - using global for demo purposes
    global.pendingRegistrations?.delete(normalizedEmail);

    return NextResponse.json(
      {
        message: "E-mail confirmado com sucesso! Sua conta foi criada.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Confirmation error:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro inesperado" },
      { status: 500 }
    );
  }
}
