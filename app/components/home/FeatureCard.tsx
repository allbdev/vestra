import { ReactNode } from "react";

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    comingSoon?: boolean;
}

export function FeatureCard({ icon, title, description, comingSoon }: FeatureCardProps) {
    return (
        <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 relative overflow-hidden group">
            {comingSoon && (
                <div className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full border border-primary/20">
                    Em breve
                </div>
            )}

            <div className="w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center mb-6 text-primary">
                {icon}
            </div>

            <h3 className="text-2xl font-bold mb-3">{title}</h3>
            <p className="text-muted leading-relaxed">
                {description}
            </p>
        </div>
    );
}
