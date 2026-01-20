import axios from 'axios';

const API_URL = '/api'; // Use relative path for proxy/rewrites

export interface Profile {
  summoner_name: string;
  tag_line: string;
  max_mastery?: number;
  quantity?: number;
  role?: string;
  puuid?: string;
}

export const riotApi = {
  getProfiles: async (): Promise<Record<string, Profile>> => {
    const response = await axios.get(`${API_URL}/profiles`);
    return response.data;
  },
  
  getSummoner: async (name: string, tag: string) => {
    const response = await axios.get(`${API_URL}/summoner/${name}/${tag}`);
    return response.data;
  },
  
  getMastery: async (puuid: string) => {
    const response = await axios.get(`${API_URL}/mastery/${puuid}`);
    return response.data;
  },
  
  getDDragonVersion: async (): Promise<string> => {
    const response = await axios.get(`${API_URL}/ddragon-version`);
    return response.data.version;
  },
  
  getChampionData: async (version: string) => {
    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
    return response.data.data;
  }
};
