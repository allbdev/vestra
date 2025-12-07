import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/app/lib/db";
import { generateSessionToken, getTokenExpiry } from "@/app/lib/auth";

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Find user by email
    let user;
    try {
      user = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (dbError: any) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { 
          error: "Erro de conexão com o banco de dados. Verifique se o MySQL está rodando.",
          details: process.env.NODE_ENV === "development" ? dbError.message : undefined
        },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos" },
        { status: 401 }
      );
    }

    // Check if user is deleted
    if (user.deletedAt) {
      return NextResponse.json(
        { error: "Conta desativada" },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos" },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = getTokenExpiry();

    // Delete old sessions for this user (optional - you can keep multiple sessions)
    // await db.session.deleteMany({
    //   where: { userId: user.id },
    // });

    // Create new session
    try {
      await db.session.create({
        data: {
          userId: user.id,
          token: sessionToken,
          expiresAt,
        },
      });
    } catch (sessionError: any) {
      console.error("Session creation error:", sessionError);
      return NextResponse.json(
        { 
          error: "Erro ao criar sessão. Tente novamente.",
          details: process.env.NODE_ENV === "development" ? sessionError.message : undefined
        },
        { status: 500 }
      );
    }

    // Return user data and session token
    return NextResponse.json(
      {
        message: "Login realizado com sucesso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        sessionToken,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { 
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
