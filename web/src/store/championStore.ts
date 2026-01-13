import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { riotApi, type Profile } from '../api/riot';

interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  roles: string[]; // Added roles
  image: {
    full: string;
    sprite: string;
    group: string;
  };
  mastery?: number; // Level
  masteryPoints?: number; // Points
}

interface ChampionStore {
  champions: Champion[];
  filteredChampions: Champion[];
  version: string;
  loading: boolean;
  
  // Filters
  filterRole: string | null;
  searchQuery: string;
  maxMastery: number | null;
  sortBy: 'name' | 'mastery';

  // Persistent Settings
  drawCount: number;

  // Profile State
  profiles: Record<string, Profile>;
  currentProfile: Profile | null;
  
  // Actions
  fetchData: () => Promise<void>;
  loadProfiles: () => Promise<void>;
  createProfile: (summonerName: string, tagLine: string) => Promise<void>;
  deleteProfile: (profileId: string) => void;
  selectProfile: (profileId: string) => Promise<void>;
  drawChampion: (quantity?: number) => Champion[];
  
  setFilterRole: (role: string | null) => void;
  setSearchQuery: (query: string) => void;
  setMaxMastery: (level: number | null) => void;
  setSortBy: (sort: 'name' | 'mastery') => void;
  setDrawCount: (count: number) => void;
  filter: () => void;
}

const ROLE_MAPPING: Record<string, string> = {
  'TOP': 'Top',
  'JUNGLE': 'Jungle',
  'MIDDLE': 'Mid',
  'BOTTOM': 'ADC',
  'UTILITY': 'Support'
};

export const useChampionStore = create<ChampionStore>()(
  persist(
    (set, get) => ({
      champions: [],
      filteredChampions: [],
      version: '',
      loading: true,
      filterRole: null,
      searchQuery: '',
      maxMastery: null,
      sortBy: 'name',
      
      drawCount: 1,

      profiles: {},
      currentProfile: null,

      loadProfiles: async () => {
         // With persistence, we might not need to "load" from API if we have them saved.
         // But we might want to refresh valid profiles?
         // For now, trust local storage.
      },

      createProfile: async (summonerName, tagLine) => {
        try {
           const summoner = await riotApi.getSummoner(summonerName, tagLine);
           // Generate a unique ID for the profile key
           const profileId = `${summonerName}#${tagLine}`.toLowerCase();
           
           const newProfile: Profile = {
             summoner_name: summoner.gameName || summonerName,
             tag_line: summoner.tagLine || tagLine,
           };
           
           // We need to fetch mastery to confirm/cache?
           // The selectProfile does the heavy lifting of fetching mastery.
           
           const profiles = { ...get().profiles, [profileId]: newProfile };
           set({ profiles });
           
           // Trigger select
           await get().selectProfile(profileId);
        } catch (e) {
           console.error("Error creating profile", e);
           throw e;
        }
      },

      deleteProfile: (profileId) => {
        const { profiles, currentProfile } = get();
        const newProfiles = { ...profiles };
        delete newProfiles[profileId];
        
        let newCurrent = currentProfile;
        // If we deleted the current profile, deselect
        if (currentProfile && `${currentProfile.summoner_name}#${currentProfile.tag_line}`.toLowerCase() === profileId) {
            newCurrent = null;
        }
        
        set({ profiles: newProfiles, currentProfile: newCurrent });
      },

      selectProfile: async (profileId) => {
        const profile = get().profiles[profileId];
        if (profile) {
           set({ currentProfile: profile, loading: true });
           try {
             const summoner = await riotApi.getSummoner(profile.summoner_name, profile.tag_line);
             const masteryData = await riotApi.getMastery(summoner.puuid);
             
             // Map mastery to champions
             const levelMap = new Map<number, number>(masteryData.map((m: any) => [m.championId, m.championLevel]));
             const pointsMap = new Map<number, number>(masteryData.map((m: any) => [m.championId, m.championPoints]));
             
             const { champions } = get();
             const updatedChampions: Champion[] = champions.map(c => ({
                ...c,
                mastery: Number(levelMap.get(parseInt(c.key))) || 0,
                masteryPoints: Number(pointsMap.get(parseInt(c.key))) || 0
             }));
             
             set({ champions: updatedChampions, currentProfile: profile, loading: false });
             get().filter();
           } catch (e) {
              console.error("Error loading profile data", e);
              set({ loading: false });
           }
        }
      },

      drawChampion: (quantity) => {
        const { filteredChampions, drawCount } = get();
        if (filteredChampions.length === 0) return [];
        
        const count = quantity || drawCount;
        const shuffled = [...filteredChampions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      },

      setDrawCount: (count) => set({ drawCount: count }),

      fetchData: async () => {
        set({ loading: true });
        try {
          const version = await riotApi.getDDragonVersion();
          
          // Fetch champion data and role data in parallel
          const [championDataResponse, roleDataResponse] = await Promise.all([
            riotApi.getChampionData(version),
            fetch("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-rune-recommendations.json")
          ]);

          const data = championDataResponse;
          const roleData = await roleDataResponse.json();
          
          // Create a map of championId (key) to roles
          const championRolesMap = new Map<string, Set<string>>();
          
          roleData.forEach((entry: any) => {
              const startId = entry.championId.toString();
               // We need to match this ID with the Champion.key
               
               if (!championRolesMap.has(startId)) {
                   championRolesMap.set(startId, new Set());
               }
               
               entry.runeRecommendations.forEach((rec: any) => {
                   if (rec.position && rec.position !== 'NONE') {
                       const mappedRole = ROLE_MAPPING[rec.position];
                       if (mappedRole) {
                           championRolesMap.get(startId)?.add(mappedRole);
                       }
                   }
               });
          });

          const champions: Champion[] = Object.values(data).map((champ: any) => {
              // champ.key is the ID we use for matching
              const roles = Array.from(championRolesMap.get(champ.key) || []);
              return {
                  ...champ,
                  roles: roles.length > 0 ? roles : champ.tags // Fallback to tags or empty? CLI doesn't fallback, but allows partial match. Let's just use roles.
              };
          });
          
          set({ champions, filteredChampions: champions, version, loading: false });
          
          // Re-select current profile if exists to re-apply mastery
          const { currentProfile } = get();
          if (currentProfile) {
              const id = `${currentProfile.summoner_name}#${currentProfile.tag_line}`.toLowerCase();
              get().selectProfile(id);
          }
        } catch (error) {
          console.error("Failed to fetch champion data", error);
          set({ loading: false });
        }
      },

      setFilterRole: (role) => {
        set({ filterRole: role });
        get().filter();
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().filter();
      },

      setMaxMastery: (level) => {
        set({ maxMastery: level });
        get().filter();
      },

      setSortBy: (sort) => {
        set({ sortBy: sort });
        get().filter();
      },

      filter: () => {
        const { champions, filterRole, searchQuery, maxMastery, sortBy } = get();
        let result = champions;

        if (filterRole) {
          result = result.filter(c => c.roles.includes(filterRole));
        }

        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          result = result.filter(c => c.name.toLowerCase().includes(lowerQuery));
        }
        
        if (maxMastery !== null) {
           result = result.filter(c => (c.mastery || 0) <= maxMastery);
        }

        result = [...result].sort((a, b) => {
          if (sortBy === 'mastery') {
            const pointsA = a.masteryPoints || 0;
            const pointsB = b.masteryPoints || 0;
            if (pointsA !== pointsB) return pointsB - pointsA;
          }
          return a.name.localeCompare(b.name);
        });

        set({ filteredChampions: result });
      }
    }),
    {
      name: 'champion-storage', // unique name
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
          profiles: state.profiles, 
          currentProfile: state.currentProfile,
          drawCount: state.drawCount
      }), // Persist profiles and settings
    }
  )
);

