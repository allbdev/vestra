import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get session token from Authorization header or cookie
    const authHeader = request.headers.get("authorization");
    const sessionToken = authHeader?.replace("Bearer ", "") || 
                         request.cookies.get("sessionToken")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Token de sessão não fornecido" },
        { status: 401 }
      );
    }

    // Find session in database
    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Sessão inválida ou expirada" },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Delete expired session
      await db.session.delete({
        where: { id: session.id },
      });

      return NextResponse.json(
        { error: "Sessão expirada" },
        { status: 401 }
      );
    }

    // Check if user exists
    if (!session.user) {
      // Clean up orphaned session
      await db.session.delete({
        where: { id: session.id },
      });

      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const workspaces = await db.workspaceUser.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Return user information
    return NextResponse.json(
      {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          createdAt: session.user.createdAt,
          updatedAt: session.user.updatedAt,
        },
        workspaces,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("User info error:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

