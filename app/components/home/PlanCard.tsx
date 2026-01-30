import { ReactNode } from "react";
import { Button } from "../ui";
import Link from "next/link";

interface PlanFeatureProps {
    included: boolean;
    children: ReactNode;
}

function PlanFeature({ included, children }: PlanFeatureProps) {
    return (
        <div className="flex items-start gap-3 text-sm">
            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${included ? "bg-primary/20 text-primary" : "bg-muted/20 text-muted-foreground"}`}>
                {included ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
            </div>
            <span className={included ? "text-foreground" : "text-muted-foreground"}>{children}</span>
        </div>
    );
}

interface PlanCardProps {
    name: string;
    price: string;
    description: string;
    features: { name: string; included: boolean }[];
    isPopular?: boolean;
    buttonText: string;
    href?: string;
    comingSoon?: boolean;
}

export function PlanCard({ name, price, description, features, isPopular, buttonText, href, comingSoon }: PlanCardProps) {
    return (
        <div className={`relative bg-card border rounded-2xl p-8 flex flex-col h-full transition-all duration-300 ${isPopular ? "border-primary shadow-lg shadow-primary/10 scale-105 z-10" : "border-border hover:border-primary/50"}`}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Mais Popular
                </div>
            )}

            {comingSoon && (
                <div className="absolute top-4 right-4 bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-full border border-accent/20">
                    Em breve
                </div>
            )}

            <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{description}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className="text-muted-foreground">/mês</span>
                </div>
            </div>

            <div className="space-y-4 mb-8 flex-1">
                {features.map((feature, i) => (
                    <PlanFeature key={i} included={feature.included}>
                        {feature.name}
                    </PlanFeature>
                ))}
            </div>

            <div>
                <Button
                    variant={isPopular ? "primary" : "secondary"}
                    fullWidth
                    size="lg"
                    disabled={comingSoon}
                >
                    {comingSoon ? (
                        "Entrar na Lista de Espera"
                    ) : href ? (
                        <Link href={href}>{buttonText}</Link>
                    ) : (
                        buttonText
                    )}
                </Button>
            </div>
        </div>
    );
}
