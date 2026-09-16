import { Character, Campaign } from '../types';

const STORAGE_KEYS = {
  CHARACTERS: 'mythos_characters',
  CAMPAIGNS: 'mythos_campaigns',
  ROLLS: 'mythos_rolls',
};

export const CharacterService = {
  getAll: (): Character[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
    return data ? JSON.parse(data) : [];
  },

  save: (character: Character) => {
    const characters = CharacterService.getAll();
    const index = characters.findIndex(c => c.id === character.id);
    
    if (index >= 0) {
      characters[index] = character;
    } else {
      characters.push(character);
    }
    
    localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
  },

  getById: (id: string): Character | undefined => {
    return CharacterService.getAll().find(c => c.id === id);
  }
};

export const CampaignService = {
  getAll: (): Campaign[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    return data ? JSON.parse(data) : [];
  },

  create: (campaign: Campaign) => {
    const campaigns = CampaignService.getAll();
    campaigns.push(campaign);
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
  }
};
