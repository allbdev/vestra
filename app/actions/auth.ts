"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { generateSessionToken, getTokenExpiry } from "@/app/lib/auth";
import { setSessionToken, clearSessionToken } from "@/app/lib/session";
import * as yup from "yup";
import { getSessionSelectedWorkspaceId } from "./workspace";

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Formato de e-mail inválido")
    .required("E-mail é obrigatório"),
  password: yup.string().required("Senha é obrigatória"),
});

export interface AuthFormState {
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  message?: string;
}

export async function login(
  _prevState: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate form fields
  try {
    await loginSchema.validate({ email, password }, { abortEarly: false });
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
      return {
        errors: fieldErrors,
      };
    }
    return {
      errors: {
        _form: ["Erro de validação"],
      },
    };
  }

  try {
    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return {
        errors: {
          _form: ["E-mail ou senha incorretos"],
        },
      };
    }

    // Check if user is deleted
    if (user.deletedAt) {
      return {
        errors: {
          _form: ["Conta desativada"],
        },
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        errors: {
          _form: ["E-mail ou senha incorretos"],
        },
      };
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = getTokenExpiry();

    // Create new session
    await db.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
      },
    });

    // Set session token in cookie
    await setSessionToken(sessionToken);
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      errors: {
        _form: ["Ocorreu um erro inesperado"],
      },
    };
  }

  try {
    const savedWorkspaceId = await getSessionSelectedWorkspaceId();

    // todo: check user workspaces

    if (savedWorkspaceId) {
      redirect(`/workspace/${savedWorkspaceId}/dashboard`);
    }
  } catch (error: any) {
    console.error("Set session selected workspace id error:", error);
  }

  // Redirect outside try-catch so the redirect error can propagate
  redirect("/workspace");
}

export async function logout({ shouldRedirect = true }: { shouldRedirect?: boolean } = {}): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionToken")?.value;

  if (sessionToken) {
    // Delete session from database
    await db.session.deleteMany({
      where: { token: sessionToken },
    });
  }

  // Clear session cookie
  await clearSessionToken();

  if (shouldRedirect) {
    redirect("/login");
  }
}

export interface RegisterFormState {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    password_confirmation?: string[];
    _form?: string[];
  };
  message?: string;
}

export async function register(
  _prevState: RegisterFormState | undefined,
  formData: FormData
): Promise<RegisterFormState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const password_confirmation = formData.get("password_confirmation") as string;

  // Validate required fields
  if (!email || !password || !password_confirmation) {
    return {
      errors: {
        _form: ["E-mail, senha e confirmação de senha são obrigatórios"],
      },
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      errors: {
        email: ["Formato de e-mail inválido"],
      },
    };
  }

  // Check if passwords match
  if (password !== password_confirmation) {
    return {
      errors: {
        password_confirmation: ["As senhas não coincidem"],
      },
    };
  }

  // Validate password strength
  if (password.length < 8) {
    return {
      errors: {
        password: ["A senha deve ter pelo menos 8 caracteres"],
      },
    };
  }

  try {
    // Check if email is already in use
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return {
        errors: {
          email: ["Este e-mail já está cadastrado"],
        },
      };
    }

    // Generate confirmation code
    const { generateConfirmationCode, sendConfirmationEmail } = await import("@/app/lib/email");
    const code = generateConfirmationCode();

    // Hash password
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

      return {
        errors: {
          _form: ["Falha ao enviar e-mail de confirmação. Tente novamente."],
        },
      };
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

    return {
      message: "E-mail de confirmação enviado! Verifique sua caixa de entrada e insira o código de 6 dígitos para concluir o cadastro.",
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      errors: {
        _form: ["Ocorreu um erro inesperado"],
      },
    };
  }
}

export interface ConfirmFormState {
  errors?: {
    confirmation_code?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
}

const CODE_EXPIRY_MINUTES = 5;

export async function confirm(
  _prevState: ConfirmFormState | undefined,
  formData: FormData
): Promise<ConfirmFormState> {
  const email = formData.get("email") as string;
  const confirmation_code = formData.get("confirmation_code") as string;

  // Validate required fields
  if (!email || !confirmation_code) {
    return {
      errors: {
        _form: ["E-mail e código de confirmação são obrigatórios"],
      },
    };
  }

  const normalizedEmail = email.toLowerCase();

  try {
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
      return {
        errors: {
          confirmation_code: ["Código de confirmação inválido"],
        },
      };
    }

    // Check if code is expired (5 minutes)
    const codeAge = (Date.now() - storedCode.createdAt.getTime()) / 1000 / 60; // in minutes

    if (codeAge > CODE_EXPIRY_MINUTES) {
      // Delete expired code
      await db.confirmationCode.delete({
        where: { id: storedCode.id },
      });

      return {
        errors: {
          _form: ["O código de confirmação expirou. Faça o cadastro novamente para receber um novo código."],
        },
      };
    }

    // Get pending registration data
    // @ts-expect-error - using global for demo purposes
    const pendingData = global.pendingRegistrations?.get(normalizedEmail);

    if (!pendingData) {
      return {
        errors: {
          _form: ["Dados do cadastro não encontrados. Inicie o processo de cadastro novamente."],
        },
      };
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

      return {
        errors: {
          _form: ["Este e-mail já está cadastrado"],
        },
      };
    }

    // Create the user
    const newUser = await db.user.create({
      data: {
        name: pendingData.name,
        email: normalizedEmail,
        password: pendingData.hashedPassword,
      },
    });

    // Assign free plan
    const freePlan = await db.plan.findUnique({ where: { name: "free" } });

    if (freePlan) {
      await db.userPlan.create({
        data: {
          userId: newUser.id,
          planId: freePlan.id,
        },
      });
    }

    // Clean up confirmation code and pending data
    await db.confirmationCode.delete({
      where: { id: storedCode.id },
    });
    // @ts-expect-error - using global for demo purposes
    global.pendingRegistrations?.delete(normalizedEmail);

    return {
      success: true,
      message: "E-mail confirmado com sucesso! Sua conta foi criada.",
    };
  } catch (error: any) {
    console.error("Confirmation error:", error);
    return {
      errors: {
        _form: ["Ocorreu um erro inesperado"],
      },
    };
  }
}

