import { useRef, useEffect, memo } from "react";
import gsap from "gsap";
import { Trophy } from "@phosphor-icons/react";

interface ChampionCardProps {
  champion: any;
  index: number;
}

export const ChampionCard = memo(function ChampionCard({
  champion,
  index,
}: ChampionCardProps) {
  const cardRef = useRef(null);

  useEffect(() => {
    // Reveal animation
    gsap.fromTo(
      cardRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: Math.min(index * 0.05, 1.5), // Cap delay for large lists
        ease: "power3.out",
      }
    );
  }, []); // Only run once on mount

  return (
    <a
      ref={cardRef}
      href={`https://dpm.lol/champions/${champion.id}/build`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-[3/4] bg-void overflow-hidden cursor-pointer block"
    >
      {/* Liquid Metal Border Effect */}
      <div className="absolute inset-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_80deg,var(--color-solar)_120deg,var(--color-flare)_180deg,transparent_240deg)] opacity-0 group-hover:opacity-100 group-hover:animate-spin-slow transition-opacity duration-500 z-0"></div>

      {/* Content Container (Inset to create border) */}
      <div className="absolute inset-[1px] bg-void z-10 overflow-hidden">
        <div className="absolute inset-0 bg-steel/5 transition-colors duration-500 group-hover:bg-transparent"></div>

        <img
          src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`}
          alt={champion.name}
          className="absolute inset-0 w-full h-full object-cover object-top filter grayscale contrast-125 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

        {/* Mastery Points Badge */}
        {formatMastery(champion.masteryPoints) && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 border border-white/10 px-2 py-1 rounded-full backdrop-blur-md z-30 translate-y-[-10px] opacity-0 animate-[fade-in-down_0.5s_ease-out_forwards] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <Trophy weight="fill" className="text-yellow-500 w-3 h-3" />
            <span className="text-[10px] font-mono font-bold text-yellow-100/90 tracking-wider">
              {formatMastery(champion.masteryPoints)}
            </span>
          </div>
        )}

        <div className="absolute bottom-1 left-1 xl:bottom-4 xl:left-4 z-20 w-full pr-1 xl:pr-4">
          <h3 className="font-display text-sm xl:text-2xl uppercase tracking-tighter text-mist drop-shadow-lg translate-y-0 xl:translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            {champion.name}
          </h3>
          <div className="overflow-hidden">
            <p className="font-mono text-[8px] xl:text-[10px] text-mist/60 uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-500 delay-75">
              {champion.title}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
});

function formatMastery(points?: number) {
  if (!points) return null;
  if (points >= 1000000) return (points / 1000000).toFixed(1) + "M";
  if (points >= 1000) return (points / 1000).toFixed(1) + "k";
  return points.toString();
}
