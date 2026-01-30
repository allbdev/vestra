"use client";

import { useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input, Button } from "../ui";
import { submitContactForm } from "@/app/actions/contact";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

const StyledTextArea = styled(TextField)({
    width: "100%",
    "& .MuiOutlinedInput-root": {
        borderRadius: 12,
    },
});

const schema = yup.object({
    name: yup.string().required("Nome é obrigatório"),
    email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
    phone: yup.string().optional(),
    message: yup.string().required("Mensagem é obrigatória"),
});

type FormData = {
    name: string;
    email: string;
    phone?: string;
    message: string;
};

export function ContactForm() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema) as Resolver<FormData>,
    });

    const onSubmit = async (data: FormData) => {
        setStatus("loading");
        setErrorMessage("");

        try {
            const result = await submitContactForm(data);

            if (result.success) {
                setStatus("success");
                reset();
            } else {
                setStatus("error");
                setErrorMessage(result.error || "Ocorreu um erro ao enviar a mensagem.");
            }
        } catch {
            setStatus("error");
            setErrorMessage("Erro de conexão. Verifique sua internet.");
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-card border border-border rounded-2xl p-8 shadow-sm">
            {status === "success" ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Mensagem Enviada!</h3>
                    <p className="text-muted-foreground mb-8">
                        Obrigado pelo contato. Responderemos o mais breve possível.
                    </p>
                    <Button onClick={() => setStatus("idle")} variant="secondary">
                        Enviar outra mensagem
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    <Input
                        label="Nome *"
                        error={errors.name?.message}
                        {...register("name")}
                    />

                    <Input
                        label="E-mail *"
                        type="email"
                        error={errors.email?.message}
                        {...register("email")}
                    />

                    <Input
                        label="Telefone (opcional)"
                        type="tel"
                        error={errors.phone?.message}
                        {...register("phone")}
                    />

                    <div>
                        <StyledTextArea
                            label="Mensagem *"
                            multiline
                            rows={4}
                            error={!!errors.message}
                            helperText={errors.message?.message}
                            {...register("message")}
                        />
                    </div>

                    {status === "error" && (
                        <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                            {errorMessage}
                        </div>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        disabled={status === "loading"}
                    >
                        Enviar Mensagem
                    </Button>
                </form>
            )}
        </div>
    );
}
