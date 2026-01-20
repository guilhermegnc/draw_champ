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
          <ProfileManager />
        </nav>
      </header>

      <main className="w-full min-h-screen pt-32 pb-24 px-4 md:px-12 lg:px-24">
        <Outlet />
      </main>

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-[80] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
    </div>
  );
}
