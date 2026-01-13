import { Outlet } from "react-router-dom";
import { ProfileManager } from "../profile/ProfileManager";
import { BackgroundPatterns } from "./BackgroundPatterns";

export function Layout() {
  return (
    <div className="relative min-h-screen bg-void text-mist font-sans selection:bg-mist selection:text-void overflow-hidden">
      <BackgroundPatterns />
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 md:py-8 flex justify-between items-center mix-blend-difference pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="font-display text-2xl md:text-3xl tracking-tighter uppercase font-bold text-mist">
            Draw Champ
          </h1>
        </div>
        <nav className="pointer-events-auto flex items-center gap-6">
          {/* Navigation Items */}
          <span className="font-mono text-xs uppercase tracking-widest opacity-50 hidden md:block">
            V 1.0
          </span>
          <ProfileManager />
        </nav>
      </header>

      <main className="w-full min-h-screen pt-32 pb-24 px-4 md:px-12 lg:px-24">
        <Outlet />
      </main>

      {/* Noise Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[90] opacity-[0.07] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-[80] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
    </div>
  );
}
