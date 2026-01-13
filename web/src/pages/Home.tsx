import { useEffect } from "react";
import { useChampionStore } from "../store/championStore";
import { ChampionCard } from "../components/champions/ChampionCard";
import { Filters } from "../components/ui/Filters";
import { Randomizer } from "../components/champions/Randomizer";
import gsap from "gsap";

export function Home() {
  const { filteredChampions, loading, fetchData, refreshMastery } =
    useChampionStore();

  useEffect(() => {
    fetchData();

    // Auto-refresh mastery every 20 minutes
    const interval = setInterval(() => {
      refreshMastery();
    }, 20 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchData, refreshMastery]);

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
            Initializing Protocol...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="mb-24 relative">
        <h2 className="hero-text font-display text-[12vw] leading-[0.85] font-bold tracking-tighter text-mist uppercase opacity-90 break-all select-none">
          The <span className="text-solar">Void</span> <br /> & The{" "}
          <span className="text-flare">Legend</span>
        </h2>
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
              No signals detected in the void.
            </p>
          </div>
        )}
      </section>

      <Randomizer />
    </div>
  );
}
