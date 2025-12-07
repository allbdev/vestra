import * as yup from "yup";

export interface LoginFormData {
  email: string;
  password: string;
}

export const loginSchema: yup.ObjectSchema<LoginFormData> = yup.object({
  email: yup
    .string()
    .email("Formato de e-mail inválido")
    .required("E-mail é obrigatório"),
  password: yup.string().required("Senha é obrigatória"),
});

