import { useChampionStore } from "../../store/championStore";
import { MagnifyingGlass } from "@phosphor-icons/react";
import clsx from "clsx";

const ROLES = ["Top", "Jungle", "Mid", "ADC", "Support"];

export function Filters() {
  const {
    filterRole,
    setFilterRole,
    searchQuery,
    setSearchQuery,
    setMaxMastery,
    sortBy,
    setSortBy,
  } = useChampionStore();

  return (
    <div className="sticky top-24 z-40 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 border-y border-mist/10 bg-void/90 backdrop-blur-sm transition-all duration-500 hover:border-mist/30">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterRole(null)}
          className={clsx(
            "px-4 py-2 font-mono text-xs uppercase tracking-widest border transition-all duration-300",
            filterRole === null
              ? "bg-solar text-white border-solar shadow-[0_0_15px_rgba(255,77,0,0.4)]"
              : "bg-transparent text-mist/50 border-mist/20 hover:border-solar hover:text-solar"
          )}
        >
          All
        </button>
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(filterRole === role ? null : role)}
            className={clsx(
              "px-4 py-2 font-mono text-xs uppercase tracking-widest border transition-all duration-300",
              filterRole === role
                ? "bg-solar text-white border-solar shadow-[0_0_15px_rgba(255,77,0,0.4)]"
                : "bg-transparent text-mist/50 border-mist/20 hover:border-solar hover:text-solar"
            )}
          >
            {role}
          </button>
        ))}

        <button
          onClick={() => setSortBy(sortBy === "name" ? "mastery" : "name")}
          className={clsx(
            "px-4 py-2 font-mono text-xs uppercase tracking-widest border transition-all duration-300",
            sortBy === "mastery"
              ? "bg-flare text-white border-flare shadow-[0_0_15px_rgba(255,140,0,0.4)]"
              : "bg-transparent text-mist/50 border-mist/20 hover:border-flare hover:text-flare"
          )}
        >
          {sortBy === "mastery" ? "LVL" : "AZ"}
        </button>

        <div className="flex items-center gap-2 border border-mist/20 px-3 py-2 bg-mist/5">
          <span className="font-mono text-[10px] uppercase opacity-50">
            Max Mastery:
          </span>
          <input
            type="number"
            min="0"
            placeholder="ALL"
            className="w-12 bg-transparent text-center font-mono text-xs focus:outline-none"
            onChange={(e) => {
              const val = e.target.value;
              setMaxMastery(val === "" ? null : parseInt(val));
            }}
          />
        </div>
      </div>

      <div className="relative w-full md:w-64 group">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH PROTOCOL..."
          className="w-full bg-transparent border-b border-mist/20 py-2 pl-2 pr-8 font-mono text-sm text-mist focus:outline-none focus:border-mist transition-colors placeholder:text-mist/20 uppercase"
        />
        <MagnifyingGlass
          className="absolute right-0 top-1/2 -translate-y-1/2 text-mist/40 transition-colors group-hover:text-mist"
          size={16}
        />
      </div>
    </div>
  );
}
