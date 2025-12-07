

export function BackgroundEffects() {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-[15%] w-3 h-3 bg-primary/40 rounded-full animate-float" />
        <div className="absolute top-40 right-[20%] w-2 h-2 bg-accent/40 rounded-full animate-float-delayed" />
        <div className="absolute bottom-32 left-[25%] w-4 h-4 bg-primary/30 rounded-full animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-48 right-[15%] w-2 h-2 bg-accent/30 rounded-full animate-float-delayed" style={{ animationDelay: "0.5s" }} />
      </div>
    );
  }