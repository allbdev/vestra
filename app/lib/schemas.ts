import * as yup from "yup";

export const inviteUserSchema = yup.object().shape({
  email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
});

export type InviteUserFormData = yup.InferType<typeof inviteUserSchema>;

export const transactionSchema = yup.object().shape({
  description: yup.string().required("Descrição é obrigatória"),
  amount: yup
    .number()
    .transform((value, originalValue) => {
      if (typeof originalValue === "string") {
        return originalValue === "" ? undefined : Number(originalValue.replace(",", "."));
      }
      return value;
    })
    .required("Valor é obrigatório")
    .typeError("Valor deve ser um número"),
  categoryId: yup.string().required("Categoria é obrigatória"),
  date: yup.string().required("Data é obrigatória"),
  isPaid: yup.boolean().default(false),
  paidAt: yup.string().nullable().when("isPaid", {
    is: true,
    then: (schema) => schema.required("Data de pagamento é obrigatória"),
    otherwise: (schema) => schema.nullable(),
  }),
});

export type TransactionFormData = yup.InferType<typeof transactionSchema>;

export const registerSchema = yup.object().shape({
  name: yup.string().required("Nome é obrigatório"),
  email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
  password: yup.string().min(8, "Senha deve ter no mínimo 8 caracteres").required("Senha é obrigatória"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não conferem")
    .required("Confirmação de senha é obrigatória"),
});

export type RegisterFormData = yup.InferType<typeof registerSchema>;

export const loginSchema = yup.object().shape({
  email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
  password: yup.string().required("Senha é obrigatória"),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;

export const workspaceSchema = yup.object().shape({
  name: yup.string().required("Nome do workspace é obrigatório"),
});

export type WorkspaceFormData = yup.InferType<typeof workspaceSchema>;

export const transactionTemplateSchema = yup.object().shape({
  description: yup.string().required("Descrição é obrigatória"),
  baseAmount: yup
    .number()
    .transform((value, originalValue) => {
      if (typeof originalValue === "string") {
        return originalValue === "" ? undefined : Number(originalValue.replace(",", "."));
      }
      return value;
    })
    .required("Valor é obrigatório")
    .typeError("Valor deve ser um número"),
  categoryId: yup.string().required("Categoria é obrigatória"),
  frequency: yup.number().required("Frequência é obrigatória"),
  startDate: yup.string().required("Data de início é obrigatória"),
  active: yup.boolean().default(true),
});

export type TransactionTemplateFormData = yup.InferType<typeof transactionTemplateSchema>;

export const categorySchema = yup.object().shape({
  name: yup.string().required("Nome é obrigatório"),
  type: yup.number().required("Tipo é obrigatório"),
  color: yup.string().nullable().default(null),
});

export type CategoryFormData = yup.InferType<typeof categorySchema>;
