import * as yup from "yup";

export type Step = "register" | "confirm";

export interface RegisterFormData {
  name?: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const registerSchema: yup.ObjectSchema<RegisterFormData> = yup.object({
  name: yup.string(),
  email: yup
    .string()
    .email("Formato de e-mail inválido")
    .required("E-mail é obrigatório"),
  password: yup
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .required("Senha é obrigatória"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não coincidem")
    .required("Confirmação de senha é obrigatória"),
});