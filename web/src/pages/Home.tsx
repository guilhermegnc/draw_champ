import { useEffect } from "react";
import { useChampionStore } from "../store/championStore";
import { ChampionCard } from "../components/champions/ChampionCard";
import { Filters } from "../components/ui/Filters";
import { Randomizer } from "../components/champions/Randomizer";
import gsap from "gsap";

export function Home() {
  const {
    filteredChampions,
    loading,
    fetchData,
    refreshMastery,
    currentProfile,
  } = useChampionStore();

  useEffect(() => {
    fetchData();

    // Auto-refresh mastery every 20 minutes if profile exists
    // Optimized to only run when the page is visible to save resources
    let interval: ReturnType<typeof setInterval> | null = null;

    const startInterval = () => {
      if (!currentProfile) return;

      // Clear existing if any
      if (interval) clearInterval(interval);

      interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          refreshMastery();
        }
      }, 20 * 60 * 1000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // When becoming visible, we might want to refresh immediately if it's been a while?
        // For now, just ensuring the interval loop is active/checked is enough.
        // Actually, the interval keeps running but only executes the callback logic if visible.
        // But to save even more CPU, we could clear/restart interval.
        // For simplicity and safety, checking state inside the interval is cheap enough for a 20min timer.
        // However, the user complained about FPS *whlie* playing, meaning the site is hidden.
        // So executing the logic inside the interval check is better.
      }
    };

    if (currentProfile) {
      startInterval();
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchData, refreshMastery, currentProfile]);

  // Animate Hero text on mount
  useEffect(() => {
    gsap.fromTo(
      ".hero-text",
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", stagger: 0.1 }
    );
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border border-mist/20 border-t-mist rounded-full animate-spin"></div>
          <span className="font-mono text-sm uppercase tracking-widest animate-pulse">
            Initializing...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="h-screen -mt-32 w-full flex flex-col justify-center items-center relative overflow-hidden">
        <style>
          {`
            @keyframes glitch-skew {
              0% { transform: skew(0deg); }
              10% { transform: skew(-2deg); }
              20% { transform: skew(2deg); }
              30% { transform: skew(-1deg); }
              40% { transform: skew(3deg); }
              50% { transform: skew(-0.5deg); }
              60% { transform: skew(1deg); }
              70% { transform: skew(-0.2deg); }
              80% { transform: skew(0.5deg); }
              90% { transform: skew(-0.1deg); }
              100% { transform: skew(0deg); }
            }
            @keyframes glitch-anim {
              0% { clip-path: inset(80% 0 0 0); transform: translate(-2px, 1px); }
              20% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
              40% { clip-path: inset(50% 0 30% 0); transform: translate(-2px, 2px); }
              60% { clip-path: inset(20% 0 70% 0); transform: translate(2px, -2px); }
              80% { clip-path: inset(70% 0 10% 0); transform: translate(-1px, 1px); }
              100% { clip-path: inset(0 0 80% 0); transform: translate(1px, -1px); }
            }
            @keyframes glitch-anim-2 {
              0% { clip-path: inset(10% 0 80% 0); transform: translate(2px, -1px); }
              20% { clip-path: inset(80% 0 0 0); transform: translate(-2px, 2px); }
              40% { clip-path: inset(30% 0 50% 0); transform: translate(2px, -2px); }
              60% { clip-path: inset(70% 0 20% 0); transform: translate(-1px, 1px); }
              80% { clip-path: inset(0 0 70% 0); transform: translate(1px, -1px); }
              100% { clip-path: inset(60% 0 10% 0); transform: translate(-2px, 1px); }
            }
            .glitch {
              position: relative;
            }
            .glitch::before,
            .glitch::after {
              content: attr(data-text);
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: var(--color-void);
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
            .glitch::before {
              left: 2px;
              text-shadow: -1px 0 #ff00c1;
              animation: glitch-anim-2 3s infinite linear alternate-reverse;
              display: none;
            }
            .glitch::after {
              left: -2px;
              text-shadow: -1px 0 #00fff9;
              animation: glitch-anim 2.5s infinite linear alternate-reverse;
              display: none;
            }
            .glitch:hover {
              animation: glitch-skew 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
              text-shadow: 2px 0 #ff00c1, -2px 0 #00fff9;
            }
            .glitch:hover::before {
              display: block;
              animation: glitch-anim-2 0.4s infinite linear alternate-reverse;
              clip-path: inset(0 0 0 0);
            }
            .glitch:hover::after {
              display: block;
              animation: glitch-anim 0.4s infinite linear alternate-reverse;
              clip-path: inset(0 0 0 0);
            }
          `}
        </style>
        <div className="flex flex-col items-center justify-center w-full max-w-[95vw]">
          <h2 className="hero-text font-display text-[3vw] md:text-[1.5vw] tracking-[0.5em] text-mist/60 uppercase mb-4">
            Master your
          </h2>
          <h1
            className="glitch hero-text font-display text-[11vw] leading-[0.8] font-black tracking-tighter text-solar uppercase mix-blend-screen z-10 transition-all duration-700 cursor-default"
            data-text="CHAMPIONS"
          >
            Champions
          </h1>
          <div className="hero-text flex items-center gap-4 my-8 opacity-80">
            <div className="h-[1px] w-12 md:w-24 bg-mist/30" />
            <span className="font-mono text-mist text-lg uppercase tracking-widest">
              &
            </span>
            <div className="h-[1px] w-12 md:w-24 bg-mist/30" />
          </div>
          <h2 className="hero-text font-display text-[3vw] md:text-[1.5vw] tracking-[0.5em] text-mist/60 uppercase mb-4">
            Challenge your
          </h2>
          <h1
            className="glitch hero-text font-display text-[11vw] leading-[0.8] font-black tracking-tighter text-flare uppercase mix-blend-screen z-10 transition-all duration-700 cursor-default"
            data-text="POOL"
          >
            Pool
          </h1>
        </div>
      </section>

      <Filters />

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredChampions.map((champ, index) => (
            <ChampionCard key={champ.key} champion={champ} index={index} />
          ))}
        </div>
        {filteredChampions.length === 0 && (
          <div className="py-24 text-center border border-mist/10 bg-void/50">
            <p className="font-mono text-mist/50 uppercase tracking-widest">
              No Champions found.
            </p>
          </div>
        )}
      </section>

      <Randomizer />
    </div>
  );
}
