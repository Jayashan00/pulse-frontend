export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      {/* Hero panel — the signature Pulse orb */}
      <section className="relative hidden items-center justify-center overflow-hidden bg-surface-dark lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.25),transparent_55%)]" />
        <div className="perspective relative z-10 flex flex-col items-center gap-10 px-12 text-center">
          <div className="relative">
            <div className="orb h-56 w-56 animate-float" style={{ transformStyle: 'preserve-3d' }} />
            <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-pulse-ring" />
            <div className="orb absolute -right-16 top-6 h-16 w-16 animate-float opacity-80" style={{ animationDelay: '1.2s' }} />
            <div className="orb absolute -left-20 bottom-2 h-10 w-10 animate-float opacity-60" style={{ animationDelay: '2.4s' }} />
          </div>
          <div>
            <h1 className="font-display text-5xl font-bold tracking-tight text-white">
              Share your <span className="bg-pulse bg-clip-text text-transparent">moment</span>
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-white/60">
              Post, discover and connect. Pulse is where moments become movements.
            </p>
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
