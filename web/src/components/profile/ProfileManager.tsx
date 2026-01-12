import { useState } from "react";
import { useChampionStore } from "../../store/championStore";
import { X, User, Trash, Plus } from "@phosphor-icons/react";
import clsx from "clsx";
import gsap from "gsap";
import { createPortal } from "react-dom";

export function ProfileManager() {
  const {
    profiles,
    currentProfile,
    createProfile,
    selectProfile,
    deleteProfile,
  } = useChampionStore();
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [sName, setSName] = useState("");
  const [tLine, setTLine] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Animate in
      setTimeout(() => {
        gsap.fromTo(
          "#profile-modal",
          { autoAlpha: 0, y: -20 },
          { autoAlpha: 1, y: 0, duration: 0.3 }
        );
      }, 10);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createProfile(sName, tLine);
      setSName("");
      setTLine("");
      setIsOpen(false);
    } catch (err) {
      alert("Failed to find summoner. Check name and tag.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={toggle}
        className="flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-widest border border-mist/20 hover:border-solar hover:text-solar transition-colors pointer-events-auto"
      >
        <User size={16} />
        {currentProfile ? currentProfile.summoner_name : "Connect Profile"}
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-void/80 backdrop-blur-md"
              onClick={toggle}
            ></div>
            <div
              id="profile-modal"
              className="relative w-full max-w-md border border-solar/20 p-8 shadow-[0_0_50px_rgba(255,77,0,0.1)] z-[9999]"
              style={{ backgroundColor: "#050505" }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-display text-2xl uppercase text-mist">
                  Connect Profile
                </h2>
                <button onClick={toggle}>
                  <X size={24} className="text-mist" />
                </button>
              </div>

              <form onSubmit={handleConnect} className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase mb-2 opacity-50 text-mist">
                      Summoner Name
                    </label>
                    <input
                      value={sName}
                      onChange={(e) => setSName(e.target.value)}
                      className="w-full bg-transparent border-b border-mist/20 py-2 focus:outline-none focus:border-mist font-mono uppercase text-mist"
                      required
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase mb-2 opacity-50 text-mist">
                      Tag Line
                    </label>
                    <input
                      value={tLine}
                      onChange={(e) => setTLine(e.target.value)}
                      className="w-full bg-transparent border-b border-mist/20 py-2 focus:outline-none focus:border-mist font-mono uppercase placeholder:text-mist/20 text-mist"
                      placeholder="TAG"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-mist text-void font-mono text-xs uppercase font-bold hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Verifying..."
                  ) : (
                    <>
                      Connect <Plus size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Saved Profiles List */}
              <div className="space-y-4 border-t border-mist/10 pt-6">
                <h3 className="font-mono text-xs uppercase opacity-50 text-mist">
                  Saved Profiles
                </h3>

                {Object.keys(profiles).length === 0 ? (
                  <p className="font-mono text-sm text-mist/30 italic">
                    No profiles saved.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.keys(profiles).map((id) => (
                      <div
                        key={id}
                        className={clsx(
                          "group w-full flex items-center justify-between p-3 border hover:border-mist hover:bg-mist/5 transition-all",
                          currentProfile &&
                            `${currentProfile.summoner_name}#${currentProfile.tag_line}`.toLowerCase() ===
                              id
                            ? "border-mist bg-mist/10"
                            : "border-mist/10"
                        )}
                      >
                        <button
                          onClick={() => {
                            selectProfile(id);
                            setIsOpen(false);
                          }}
                          className="flex-1 text-left"
                        >
                          <span className="font-mono text-sm text-mist uppercase">
                            {profiles[id].summoner_name}
                          </span>
                          <span className="ml-2 font-mono text-xs text-mist/50">
                            #{profiles[id].tag_line}
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Forget this profile?"))
                              deleteProfile(id);
                          }}
                          className="p-2 text-mist/30 hover:text-red-500 transition-colors"
                          title="Delete Profile"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
