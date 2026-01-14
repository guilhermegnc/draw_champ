import { useState, useRef, useEffect } from "react";
import { useChampionStore } from "../../store/championStore";
import { DiceFive, X } from "@phosphor-icons/react";
import gsap from "gsap";
import { ChampionCard } from "./ChampionCard";

export function Randomizer() {
  const { drawChampion, drawCount, setDrawCount } = useChampionStore();
  const [result, setResult] = useState<any[] | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const containerRef = useRef(null);

  const controlsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight * 0.3; // Show after scrolling 30% of viewport

      if (scrollY > threshold) {
        gsap.to(controlsRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
          overwrite: true,
        });
      } else {
        gsap.to(controlsRef.current, {
          opacity: 0,
          y: 50,
          duration: 0.5,
          ease: "power3.out",
          overwrite: true,
        });
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDraw = () => {
    setIsRolling(true);
    // Use store drawCount (defaults to 1 if not set)
    const qty = drawCount || 1;

    // Simulate roll time
    setTimeout(() => {
      const drawn = drawChampion(qty);
      setResult(drawn);
      setIsRolling(false);
    }, 1500); // 1.5s drama
  };

  const close = () => {
    setResult(null);
  };

  useEffect(() => {
    if (result && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  }, [result]);

  return (
    <>
      <div
        ref={controlsRef}
        className="fixed bottom-8 right-8 z-40 flex flex-col items-center gap-4 opacity-0"
      >
        {/* Quantity Selector */}
        <div className="bg-void/90 border border-mist/20 rounded-full px-4 py-2 flex items-center gap-2 backdrop-blur-md shadow-xl group hover:border-solar/50 transition-colors">
          <span className="text-xs font-mono uppercase text-mist/50">Qty</span>
          <input
            type="number"
            min={1}
            max={5}
            value={drawCount}
            onChange={(e) => setDrawCount(Number(e.target.value))}
            className="w-8 bg-transparent text-center font-bold text-mist outline-none focus:text-solar"
          />
        </div>

        {/* Draw Button */}
        <button
          onClick={handleDraw}
          className="bg-mist text-void p-6 rounded-full shadow-2xl hover:scale-110 hover:bg-white hover:text-solar transition-all active:scale-95 group"
        >
          <DiceFive
            size={32}
            weight="fill"
            className="group-hover:rotate-180 transition-transform duration-500"
          />
        </button>
      </div>

      {(isRolling || result) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-void/95 backdrop-blur-xl">
          <button onClick={close} className="absolute top-8 right-8 text-mist">
            <X size={32} />
          </button>

          {isRolling ? (
            <div className="text-center">
              <h2 className="font-display text-4xl md:text-6xl text-mist animate-pulse tracking-tighter uppercase">
                Summoning...
              </h2>
              <div className="w-64 h-1 bg-void border border-mist/20 mt-8 mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-mist animate-shimmer"></div>
              </div>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="flex flex-wrap items-center justify-center gap-8 p-8 max-w-[90vw] max-h-[90vh] overflow-y-auto"
            >
              {result?.map((champ, i) => (
                <div
                  key={champ.key}
                  className="w-[300px] pointer-events-none scale-125"
                >
                  <ChampionCard champion={champ} index={i} />
                </div>
              ))}

              <div className="w-full flex justify-center mt-12 gap-4 pointer-events-auto">
                <button
                  onClick={handleDraw}
                  className="px-8 py-4 bg-mist text-void font-bold font-mono uppercase tracking-widest hover:bg-white transition-colors"
                >
                  Reroll
                </button>
                <button
                  onClick={close}
                  className="px-8 py-4 border border-mist/30 text-mist font-bold font-mono uppercase tracking-widest hover:bg-mist/10 transition-colors"
                >
                  Accept
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
