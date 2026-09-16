import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc,
  updateDoc,
  collectionGroup,
  serverTimestamp,
  handleFirestoreError, 
  OperationType, 
  isQuotaExceededError, 
  getIsQuotaExhausted, 
  setQuotaExhausted
} from '../firebase/firestore';
import { Game, GamePlayer, GameStatus, PlayerStatus, CreateGameData, UpdateGameData } from '../types/game';

const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Gera um código de convite de 6 caracteres no formato XXX-XXX (ex: K7F-92A)
 * Exclui caracteres facilmente confundidos (0, O, 1, I, L).
 */
export function generateInviteCode(): string {
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 3; i++) {
    part1 += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    part2 += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return `${part1}-${part2}`;
}

const cleanUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        newObj[key] = cleanUndefined(obj[key]);
      }
    });
    return newObj;
  }
  return obj;
};

export const GameService = {
  /**
   * Gera um código de convite único conferindo se já existe em jogos ativos
   */
  async generateUniqueInviteCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateInviteCode();
      try {
        const q = query(
          collectionGroup(db, 'games'),
          where('inviteCode', '==', code)
        );
        const snapshot = await getDocs(q);
        const activeMatches = snapshot.docs.filter(
          d => d.data().status !== 'finished'
        );
        if (activeMatches.length === 0) {
          return code;
        }
      } catch (e) {
        // Se a busca global falhar (ex: falta de índice transitório), usa o código gerado
        console.warn('[GameService] Fallback na validação de código:', e);
        return code;
      }
    }
    return generateInviteCode();
  },

  /**
   * Cria um novo jogo isolado sob campaigns/{campaignId}/games/{gameId}
   */
  async createGame(
    campaignId: string,
    masterId: string,
    data: CreateGameData
  ): Promise<Game> {
    if (!campaignId) {
      throw new Error('campaignId é obrigatório para criar um jogo.');
    }
    if (!masterId) {
      throw new Error('masterId é obrigatório para criar um jogo.');
    }

    const gamesCol = collection(db, 'campaigns', campaignId, 'games');
    const gameDocRef = doc(gamesCol);
    const gameId = gameDocRef.id;
    const inviteCode = await this.generateUniqueInviteCode();
    const now = Date.now();

    const maxPlayers = Math.min(Math.max(Number(data.maxPlayers) || 5, 2), 10);

    const newGame: Game = {
      id: gameId,
      campaignId,
      name: data.name?.trim() || 'Novo Jogo',
      description: data.description?.trim() || '',
      system: data.system || 'Tormenta 20',
      coverUrl: data.coverUrl || '',
      masterId,
      inviteCode,
      status: 'lobby',
      maxPlayers,
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(gameDocRef, cleanUndefined(newGame));
      return newGame;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `campaigns/${campaignId}/games/${gameId}`
      );
      throw error;
    }
  },

  /**
   * Busca todos os jogos de uma campanha específica
   */
  async getCampaignGames(campaignId: string): Promise<Game[]> {
    if (!campaignId) return [];
    try {
      const gamesCol = collection(db, 'campaigns', campaignId, 'games');
      const snapshot = await getDocs(gamesCol);
      const games = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Game));
      return games.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.LIST,
        `campaigns/${campaignId}/games`
      );
      return [];
    }
  },

  /**
   * Busca um jogo específico garantindo que pertença à campanha
   */
  async getGame(campaignId: string, gameId: string): Promise<Game | null> {
    if (!campaignId || !gameId) return null;
    try {
      const gameRef = doc(db, 'campaigns', campaignId, 'games', gameId);
      const snap = await getDoc(gameRef);
      if (!snap.exists()) return null;
      const game = { id: snap.id, ...snap.data() } as Game;
      if (game.campaignId && game.campaignId !== campaignId) {
        throw new Error('Violação de isolamento: Jogo não pertence a esta campanha.');
      }
      return game;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.GET,
        `campaigns/${campaignId}/games/${gameId}`
      );
      return null;
    }
  },

  /**
   * Busca um jogo pelo código de convite e resolve nome do mestre
   */
  async getGameByInviteCode(
    inviteCode: string
  ): Promise<{ game: Game; campaignId: string; masterName: string } | null> {
    if (!inviteCode) return null;
    const normalizedCode = inviteCode.trim().toUpperCase();

    try {
      const q = query(
        collectionGroup(db, 'games'),
        where('inviteCode', '==', normalizedCode)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      // Pega o primeiro jogo não finalizado, ou o primeiro encontrado
      const matchedDoc = snapshot.docs.find(d => d.data().status !== 'finished') || snapshot.docs[0];
      const data = matchedDoc.data() as Game;
      
      // O campaignId deve estar no documento ou no path (campaigns/{campaignId}/games/{gameId})
      const pathSegments = matchedDoc.ref.path.split('/');
      const campaignIdFromPath = pathSegments.length >= 2 ? pathSegments[1] : '';
      const campaignId = data.campaignId || campaignIdFromPath;

      let masterName = data.masterName || 'Mestre';
      if (data.masterId && (!data.masterName || data.masterName === 'Mestre')) {
        try {
          const userSnap = await getDoc(doc(db, 'users', data.masterId));
          if (userSnap.exists() && userSnap.data()?.name) {
            masterName = userSnap.data().name;
          }
        } catch (e) {
          console.warn('[GameService] Não foi possível obter o perfil do mestre:', e);
        }
      }

      return {
        game: { id: matchedDoc.id, ...data, campaignId, masterName },
        campaignId,
        masterName
      };
    } catch (error) {
      console.error('[GameService] Erro ao buscar por código de convite:', error);
      return null;
    }
  },

  /**
   * Atualiza dados de um jogo
   */
  async updateGame(
    campaignId: string,
    gameId: string,
    data: UpdateGameData
  ): Promise<void> {
    if (!campaignId || !gameId) throw new Error('Parâmetros inválidos');
    try {
      const gameRef = doc(db, 'campaigns', campaignId, 'games', gameId);
      const updatePayload: any = {
        ...data,
        updatedAt: Date.now()
      };
      if (data.maxPlayers) {
        updatePayload.maxPlayers = Math.min(Math.max(Number(data.maxPlayers) || 5, 2), 10);
      }
      await updateDoc(gameRef, cleanUndefined(updatePayload));
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `campaigns/${campaignId}/games/${gameId}`
      );
      throw error;
    }
  },

  /**
   * Altera o status do jogo (lobby | active | paused | finished)
   */
  async updateGameStatus(
    campaignId: string,
    gameId: string,
    status: GameStatus
  ): Promise<void> {
    if (!campaignId || !gameId) throw new Error('Parâmetros inválidos');
    try {
      const gameRef = doc(db, 'campaigns', campaignId, 'games', gameId);
      const now = Date.now();
      const updates: any = {
        status,
        updatedAt: now
      };

      if (status === 'active') {
        updates.startedAt = now;
      } else if (status === 'finished') {
        updates.finishedAt = now;
      }

      await updateDoc(gameRef, updates);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `campaigns/${campaignId}/games/${gameId}`
      );
      throw error;
    }
  },

  /**
   * Exclui um jogo do Firestore
   */
  async deleteGame(campaignId: string, gameId: string): Promise<void> {
    if (!campaignId || !gameId) throw new Error('Parâmetros inválidos');
    try {
      const gameRef = doc(db, 'campaigns', campaignId, 'games', gameId);
      await deleteDoc(gameRef);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `campaigns/${campaignId}/games/${gameId}`
      );
      throw error;
    }
  },

  /**
   * Listener em tempo real para os jogos de uma campanha
   */
  subscribeToCampaignGames(
    campaignId: string,
    callback: (games: Game[]) => void
  ): () => void {
    if (!campaignId) {
      callback([]);
      return () => {};
    }

    const gamesCol = collection(db, 'campaigns', campaignId, 'games');
    return onSnapshot(
      gamesCol,
      snapshot => {
        const games = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Game));
        games.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(games);
      },
      error => {
        console.error('[GameService] Erro no listener de jogos:', error);
      }
    );
  },

  /**
   * Listener em tempo real para um jogo específico
   */
  subscribeToGame(
    campaignId: string,
    gameId: string,
    callback: (game: Game | null) => void
  ): () => void {
    if (!campaignId || !gameId) {
      callback(null);
      return () => {};
    }

    const gameRef = doc(db, 'campaigns', campaignId, 'games', gameId);
    return onSnapshot(
      gameRef,
      snap => {
        if (!snap.exists()) {
          callback(null);
          return;
        }
        callback({ id: snap.id, ...snap.data() } as Game);
      },
      error => {
        console.error('[GameService] Erro no listener do jogo:', error);
      }
    );
  },

  /**
   * Obtém todos os jogadores da mesa
   */
  async getGamePlayers(campaignId: string, gameId: string): Promise<GamePlayer[]> {
    if (!campaignId || !gameId) return [];
    try {
      const playersCol = collection(db, 'campaigns', campaignId, 'games', gameId, 'players');
      const snap = await getDocs(playersCol);
      const players = snap.docs.map(d => ({ id: d.id, ...d.data() } as GamePlayer));
      return players.sort((a, b) => {
        if (a.role === 'master') return -1;
        if (b.role === 'master') return 1;
        return a.displayName.localeCompare(b.displayName);
      });
    } catch (e) {
      console.error('[GameService] Erro ao buscar jogadores:', e);
      return [];
    }
  },

  /**
   * Registra ou reativa a presença de um jogador na mesa (campaigns/{campaignId}/games/{gameId}/players/{playerId})
   * Evita duplicação desnecessária consultando userId ou identificador local existente.
   */
  async joinGame(
    campaignId: string,
    gameId: string,
    playerInput: {
      displayName: string;
      userId?: string;
      characterId?: string;
      characterName?: string;
      characterClass?: string;
      characterLevel?: number;
      characterRace?: string;
      characterAvatar?: string;
    }
  ): Promise<GamePlayer> {
    if (!campaignId || !gameId) throw new Error('Parâmetros de jogo inválidos.');
    const trimmedName = playerInput.displayName?.trim() || 'Aventureiro';

    const playersCol = collection(db, 'campaigns', campaignId, 'games', gameId, 'players');
    const existingSnap = await getDocs(playersCol);
    const existingPlayers = existingSnap.docs.map(d => ({ id: d.id, ...d.data() } as GamePlayer));

    // 1. Verifica se o jogador já existe (por userId ou por ID salvo no localStorage)
    const localPlayerKey = `realmor_game_player_${gameId}`;
    const localPlayerId = typeof window !== 'undefined' ? localStorage.getItem(localPlayerKey) : null;

    let matchedPlayer: GamePlayer | undefined;

    if (playerInput.userId) {
      matchedPlayer = existingPlayers.find(p => p.userId === playerInput.userId && p.role === 'player');
    }
    if (!matchedPlayer && localPlayerId) {
      matchedPlayer = existingPlayers.find(p => p.id === localPlayerId && p.role === 'player');
    }

    if (matchedPlayer) {
      // Reativa o jogador existente sem criar duplicatas
      const playerRef = doc(playersCol, matchedPlayer.id);
      const updateData: any = {
        status: 'online',
        lastSeenAt: serverTimestamp(),
        displayName: trimmedName || matchedPlayer.displayName
      };
      if (playerInput.userId && !matchedPlayer.userId) {
        updateData.userId = playerInput.userId;
      }
      if (playerInput.characterId) {
        updateData.characterId = playerInput.characterId;
        if (playerInput.characterName) updateData.characterName = playerInput.characterName;
        if (playerInput.characterClass) updateData.characterClass = playerInput.characterClass;
        if (playerInput.characterLevel) updateData.characterLevel = playerInput.characterLevel;
        if (playerInput.characterRace) updateData.characterRace = playerInput.characterRace;
        if (playerInput.characterAvatar) updateData.characterAvatar = playerInput.characterAvatar;
      }
      await updateDoc(playerRef, updateData);
      if (typeof window !== 'undefined') {
        localStorage.setItem(localPlayerKey, matchedPlayer.id);
      }
      return {
        ...matchedPlayer,
        status: 'online',
        displayName: trimmedName || matchedPlayer.displayName,
        characterId: playerInput.characterId || matchedPlayer.characterId,
        characterName: playerInput.characterName || matchedPlayer.characterName,
        characterClass: playerInput.characterClass || matchedPlayer.characterClass,
        characterLevel: playerInput.characterLevel || matchedPlayer.characterLevel,
        characterRace: playerInput.characterRace || matchedPlayer.characterRace,
        characterAvatar: playerInput.characterAvatar || matchedPlayer.characterAvatar
      };
    }

    const game = await this.getGame(campaignId, gameId);
    if (!game) throw new Error('Mesa de jogo não encontrada.');

    // REGRA ESTRITA: O criador/Mestre do jogo NÃO deve ser adicionado à lista de jogadores (GamePlayer)
    if (playerInput.userId && game.masterId === playerInput.userId) {
      return {
        id: playerInput.userId,
        gameId,
        campaignId,
        userId: playerInput.userId,
        displayName: playerInput.displayName || 'Mestre',
        role: 'master',
        status: 'online',
        joinedAt: serverTimestamp(),
        lastSeenAt: serverTimestamp()
      };
    }

    const currentAdventurers = existingPlayers.filter(p => p.role === 'player' && p.userId !== game.masterId);
    if (currentAdventurers.length >= game.maxPlayers) {
      throw new Error(`A mesa já atingiu o limite de ${game.maxPlayers} jogadores.`);
    }

    // 3. Cria o novo documento do jogador
    const newPlayerRef = doc(playersCol);
    const playerId = newPlayerRef.id;

    const newPlayer: GamePlayer = {
      id: playerId,
      gameId,
      campaignId,
      userId: playerInput.userId || undefined,
      displayName: trimmedName,
      characterId: playerInput.characterId || undefined,
      characterName: playerInput.characterName || undefined,
      characterClass: playerInput.characterClass || undefined,
      characterLevel: playerInput.characterLevel || undefined,
      characterRace: playerInput.characterRace || undefined,
      characterAvatar: playerInput.characterAvatar || undefined,
      role: 'player',
      status: 'online',
      ready: false,
      joinedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp()
    };

    await setDoc(newPlayerRef, cleanUndefined(newPlayer));

    if (typeof window !== 'undefined') {
      localStorage.setItem(localPlayerKey, playerId);
    }

    return newPlayer;
  },

  /**
   * Vincula ou troca o personagem do jogador na partida (campaigns/{campaignId}/games/{gameId}/players/{playerId})
   */
  async updatePlayerCharacter(
    campaignId: string,
    gameId: string,
    playerId: string,
    characterData: {
      id: string;
      name: string;
      className?: string;
      level?: number;
      race?: string;
      avatarUrl?: string;
    }
  ): Promise<void> {
    if (!campaignId || !gameId || !playerId) throw new Error('Parâmetros inválidos');
    try {
      const playerRef = doc(db, 'campaigns', campaignId, 'games', gameId, 'players', playerId);
      await updateDoc(playerRef, {
        characterId: characterData.id,
        characterName: characterData.name,
        characterClass: characterData.className || '',
        characterLevel: characterData.level || 1,
        characterRace: characterData.race || '',
        characterAvatar: characterData.avatarUrl || '',
        lastSeenAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `campaigns/${campaignId}/games/${gameId}/players/${playerId}`
      );
      throw error;
    }
  },

  /**
   * Garante presença do Mestre sem registrá-lo como GamePlayer na lista de jogadores
   */
  async ensureMasterPlayer(
    _campaignId: string,
    _gameId: string,
    _masterId: string,
    _masterName: string
  ): Promise<void> {
    // REGRA ESTRITA: O Mestre é proprietário do jogo (masterId) e NÃO deve ser adicionado à subcoleção de jogadores (GamePlayer).
    // Isso garante a separação total entre o Modo Mestre e o Modo Jogador.
    return;
  },

  /**
   * Atualiza o status de presença do jogador (online, offline, waiting)
   */
  async updatePlayerStatus(
    campaignId: string,
    gameId: string,
    playerId: string,
    status: PlayerStatus
  ): Promise<void> {
    if (!campaignId || !gameId || !playerId) return;
    if (getIsQuotaExhausted()) return;
    try {
      const playerRef = doc(db, 'campaigns', campaignId, 'games', gameId, 'players', playerId);
      await updateDoc(playerRef, {
        status,
        lastSeenAt: serverTimestamp()
      });
    } catch (e: any) {
      if (isQuotaExceededError(e)) {
        setQuotaExhausted(true);
        return;
      }
      console.warn('[GameService] Falha ao atualizar presença:', e);
    }
  },

  /**
   * Atualiza o estado de prontidão (ready: true/false) do jogador no lobby
   */
  async updatePlayerReady(
    campaignId: string,
    gameId: string,
    playerId: string,
    ready: boolean
  ): Promise<void> {
    if (!campaignId || !gameId || !playerId) throw new Error('Parâmetros inválidos');
    try {
      const playerRef = doc(db, 'campaigns', campaignId, 'games', gameId, 'players', playerId);
      await updateDoc(playerRef, {
        ready: Boolean(ready),
        lastSeenAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `campaigns/${campaignId}/games/${gameId}/players/${playerId}`
      );
      throw error;
    }
  },

  /**
   * Inicia a aventura (Ação estritamente EXCLUSIVA do Mestre)
   * Altera status de 'lobby' para 'active'
   */
  async startGame(
    campaignId: string,
    gameId: string,
    masterUserId: string
  ): Promise<void> {
    if (!campaignId || !gameId || !masterUserId) throw new Error('Parâmetros inválidos');
    const game = await this.getGame(campaignId, gameId);
    if (!game) throw new Error('Mesa de jogo não encontrada.');
    if (game.masterId !== masterUserId) {
      throw new Error('Somente o Mestre desta mesa pode iniciar a aventura.');
    }
    try {
      const gameRef = doc(db, 'campaigns', campaignId, 'games', gameId);
      await updateDoc(gameRef, {
        status: 'active',
        startedAt: Date.now(),
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `campaigns/${campaignId}/games/${gameId}`
      );
      throw error;
    }
  },

  /**
   * Remove um jogador da mesa (Ação exclusiva do Mestre)
   */
  async removePlayer(
    campaignId: string,
    gameId: string,
    playerId: string
  ): Promise<void> {
    if (!campaignId || !gameId || !playerId) throw new Error('Parâmetros inválidos');
    try {
      const playerRef = doc(db, 'campaigns', campaignId, 'games', gameId, 'players', playerId);
      await deleteDoc(playerRef);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `campaigns/${campaignId}/games/${gameId}/players/${playerId}`
      );
      throw error;
    }
  },

  /**
   * Listener em tempo real para os jogadores da mesa
   */
  subscribeToGamePlayers(
    campaignId: string,
    gameId: string,
    callback: (players: GamePlayer[]) => void
  ): () => void {
    if (!campaignId || !gameId) {
      callback([]);
      return () => {};
    }

    const playersCol = collection(db, 'campaigns', campaignId, 'games', gameId, 'players');
    return onSnapshot(
      playersCol,
      snapshot => {
        const players = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GamePlayer));
        // Ordena: Mestre sempre no topo, depois jogadores alfabeticamente
        players.sort((a, b) => {
          if (a.role === 'master') return -1;
          if (b.role === 'master') return 1;
          return a.displayName.localeCompare(b.displayName);
        });
        callback(players);
      },
      error => {
        console.error('[GameService] Erro no listener de jogadores:', error);
      }
    );
  },

  /**
   * Altera o limite máximo de jogadores da mesa (Ação exclusiva do Mestre)
   */
  async updateGameMaxPlayers(
    campaignId: string,
    gameId: string,
    maxPlayers: number
  ): Promise<void> {
    const clamped = Math.min(Math.max(Number(maxPlayers) || 5, 2), 10);
    await this.updateGame(campaignId, gameId, { maxPlayers: clamped });
  },

  /**
   * Listener em tempo real para todos os jogos onde o usuário é Mestre
   */
  subscribeToMasterGames(
    masterId: string,
    callback: (games: Game[]) => void
  ): () => void {
    if (!masterId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collectionGroup(db, 'games'),
      where('masterId', '==', masterId)
    );

    return onSnapshot(
      q,
      snapshot => {
        const games = snapshot.docs.map(d => {
          const data = d.data() as Game;
          const pathSegments = d.ref.path.split('/');
          const campaignId = data.campaignId || (pathSegments.length >= 2 ? pathSegments[1] : '');
          return { id: d.id, ...data, campaignId } as Game;
        });
        games.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
        callback(games);
      },
      error => {
        console.error('[GameService] Erro ao buscar jogos do mestre:', error);
        callback([]);
      }
    );
  },

  /**
   * Listener em tempo real para todos os jogos onde o usuário participa como Jogador
   */
  subscribeToPlayerGames(
    userId: string,
    callback: (items: Array<{ game: Game; player: GamePlayer }>) => void
  ): () => void {
    if (!userId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collectionGroup(db, 'players'),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      async snapshot => {
        const results: Array<{ game: Game; player: GamePlayer }> = [];

        for (const playerDoc of snapshot.docs) {
          const playerData = { id: playerDoc.id, ...playerDoc.data() } as GamePlayer;
          // Considera apenas participantes com papel de jogador (ignora mestre se registrado)
          if (playerData.role && playerData.role !== 'player') {
            continue;
          }

          const pathSegments = playerDoc.ref.path.split('/');
          // Path esperado: campaigns/{campaignId}/games/{gameId}/players/{playerId}
          const campaignId = playerData.campaignId || (pathSegments.length >= 4 ? pathSegments[1] : '');
          const gameId = playerData.gameId || (pathSegments.length >= 4 ? pathSegments[3] : '');

          if (campaignId && gameId) {
            try {
              const gameSnap = await getDoc(doc(db, 'campaigns', campaignId, 'games', gameId));
              if (gameSnap.exists()) {
                const gameData = { id: gameSnap.id, ...gameSnap.data(), campaignId } as Game;
                // REGRA ESTRITA: Se o usuário é o Mestre deste jogo (masterId === userId),
                // este jogo NUNCA deve aparecer no Modo Jogador!
                if (gameData.masterId === userId) {
                  continue;
                }
                results.push({ game: gameData, player: playerData });
              }
            } catch (err) {
              console.warn(`[GameService] Falha ao carregar jogo ${gameId}:`, err);
            }
          }
        }

        results.sort((a, b) => (b.game.updatedAt || b.game.createdAt || 0) - (a.game.updatedAt || a.game.createdAt || 0));
        callback(results);
      },
      error => {
        console.error('[GameService] Erro ao buscar jogos do jogador:', error);
        callback([]);
      }
    );
  }
};
