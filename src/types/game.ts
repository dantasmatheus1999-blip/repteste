export type GameStatus = 'lobby' | 'active' | 'paused' | 'finished';
export type PlayerRole = 'master' | 'player';
export type PlayerStatus = 'online' | 'offline' | 'waiting';

export interface Game {
  id: string;
  campaignId: string;
  name: string;
  description?: string;
  system: string;
  coverUrl?: string;
  masterId: string;
  masterName?: string;
  inviteCode: string;
  status: GameStatus;
  maxPlayers: number;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  finishedAt?: number;
  lastActivityAt?: number;
}

export interface GamePlayer {
  id: string;
  gameId: string;
  campaignId?: string;
  userId?: string;
  displayName: string;
  characterId?: string;
  characterName?: string;
  characterClass?: string;
  characterLevel?: number;
  characterRace?: string;
  characterAvatar?: string;
  role: PlayerRole;
  status: PlayerStatus;
  ready?: boolean;
  joinedAt: any;
  lastSeenAt?: any;
}

export interface CreateGameData {
  name: string;
  description?: string;
  system: string;
  coverUrl?: string;
  maxPlayers: number;
}

export interface UpdateGameData {
  name?: string;
  description?: string;
  system?: string;
  coverUrl?: string;
  maxPlayers?: number;
  status?: GameStatus;
}
