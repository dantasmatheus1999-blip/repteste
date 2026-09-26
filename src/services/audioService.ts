/**
 * REALMOR Audio Service & Thematic Soundboard
 * Mapeamento Exato dos Nomes Físicos dos Arquivos na pasta `sons/` do Firebase Storage
 */

import { storage, ref, getDownloadURL, resolveStorageUrlWithFallback } from '../firebase/storage';
import { db, doc, setDoc, onSnapshot, serverTimestamp } from '../firebase/firestore';

export type SoundCategory = 
  | 'ambientes'
  | 'combate'
  | 'outros';

export type SoundType = 'ambient' | 'sfx';

export type SoundPlayState = 'idle' | 'loading' | 'playing' | 'error';

export interface ThematicSound {
  id: string;
  name: string; // Nome exibido na interface
  storagePath: string; // Caminho FÍSICO exato no Firebase Storage
  category: SoundCategory;
  type: SoundType;
  icon: string;
  description: string;
  isLoop: boolean;
  resolvedUrl?: string;
}

export interface AudioSyncPayload {
  action: 'play_ambient' | 'pause_ambient' | 'resume_ambient' | 'stop_ambient' | 'play_sfx' | 'stop_all' | 'set_volume';
  soundId?: string;
  soundName?: string;
  category?: SoundCategory;
  soundType?: SoundType;
  url?: string;
  isLoop?: boolean;
  volume: number; // 0.0 a 1.0
  timestamp: number;
  sessionId?: string;
}

export interface AudioEngineState {
  activeAmbientSoundId: string | null;
  isAmbientPlaying: boolean;
  isAmbientPaused: boolean;
  volume: number;
  statusBySoundId: Record<string, SoundPlayState>;
  errorBySoundId: Record<string, string>;
  loopBySoundId: Record<string, boolean>;
}

// MAPEAMENTO OBRIGATÓRIO DEFINITIVO COM OS NOMES FÍSICOS REAIS NO FIREBASE STORAGE
export const THEMATIC_SOUNDS: ThematicSound[] = [
  // 🌲 1. AMBIENTES
  {
    id: 'floresta_noite',
    name: 'Floresta à Noite',
    storagePath: 'sons/floresta a noite.wav',
    category: 'ambientes',
    type: 'ambient',
    icon: '🌙',
    description: 'Ambiente noturno com sons sutis da floresta sob o luar',
    isLoop: true
  },
  {
    id: 'floresta_calma',
    name: 'Floresta Calma',
    storagePath: 'sons/floresta-calma.mp3',
    category: 'ambientes',
    type: 'ambient',
    icon: '🌲',
    description: 'Natureza serena com sussurros suaves entre as árvores',
    isLoop: true
  },
  {
    id: 'caverna',
    name: 'Caverna',
    storagePath: 'sons/carverna.mp3',
    category: 'ambientes',
    type: 'ambient',
    icon: '🪨',
    description: 'Profundezas subterrâneas e atmosfera úmida de rochas',
    isLoop: true
  },
  {
    id: 'caverna_eco',
    name: 'Caverna Eco',
    storagePath: 'sons/caverna-eco.mp3',
    category: 'ambientes',
    type: 'ambient',
    icon: '🦇',
    description: 'Ecos reverberantes e goteiras em grutas profundas',
    isLoop: true
  },
  {
    id: 'dungeon_1',
    name: 'Dungeon 1',
    storagePath: 'sons/Dungeon 1.mp3',
    category: 'ambientes',
    type: 'ambient',
    icon: '💀',
    description: 'Exploração tensa e mistério em masmorra esquecida',
    isLoop: true
  },
  {
    id: 'taverna',
    name: 'Taverna',
    storagePath: 'sons/Taverna.mp3',
    category: 'ambientes',
    type: 'ambient',
    icon: '🍺',
    description: 'Estalagem acolhedora com burburinho de aventureiros',
    isLoop: true
  },
  {
    id: 'som_ambiente_tranquilo',
    name: 'Som Ambiente Tranquilo',
    storagePath: 'sons/Som ambiente tranquilo.mp3',
    category: 'ambientes',
    type: 'ambient',
    icon: '🍃',
    description: 'Trilha suave de descanso, acampamento e paz',
    isLoop: true
  },
  {
    id: 'som_ambiente_aventura',
    name: 'Som Ambiente Aventura',
    storagePath: 'sons/som ambiante aventura.mp3',
    category: 'ambientes',
    type: 'ambient',
    icon: '🧭',
    description: 'Clima de exploração empolgante por estradas e terras desconhecidas',
    isLoop: true
  },
  {
    id: 'vento',
    name: 'Vento',
    storagePath: 'sons/vento.mp3',
    category: 'ambientes',
    type: 'ambient',
    icon: '💨',
    description: 'Uivo contínuo do vento cortando vales e montanhas',
    isLoop: true
  },

  // ⚔️ 2. COMBATE
  {
    id: 'confronto',
    name: 'Confronto',
    storagePath: 'sons/confronto.mp3',
    category: 'combate',
    type: 'ambient',
    icon: '⚔️',
    description: 'Início de batalha e prontidão para combate',
    isLoop: true
  },
  {
    id: 'confronto_2',
    name: 'Confronto 2',
    storagePath: 'sons/Confronto 2.mp3',
    category: 'combate',
    type: 'ambient',
    icon: '🗡️',
    description: 'Ritmo acelerado de confronto e aço em choque',
    isLoop: true
  },
  {
    id: 'confronto_3',
    name: 'Confronto 3',
    storagePath: 'sons/confronto 3.mp3',
    category: 'combate',
    type: 'ambient',
    icon: '🛡️',
    description: 'Batalha feroz e momento decisivo do confronto',
    isLoop: true
  },
  {
    id: 'confronto_de_boss',
    name: 'Confronto de Boss',
    storagePath: 'sons/confronto de boss.mp3',
    category: 'combate',
    type: 'ambient',
    icon: '👑',
    description: 'Trilha épica e colossal para confronto contra o chefe',
    isLoop: true
  },
  {
    id: 'boss_2',
    name: 'Boss 2',
    storagePath: 'sons/boss 2.mp3',
    category: 'combate',
    type: 'ambient',
    icon: '👹',
    description: 'Desafio supremo contra monstro devastador',
    isLoop: true
  },

  // ✨ 3. OUTROS
  {
    id: 'enigma',
    name: 'Enigma',
    storagePath: 'sons/Eniguima.mp3',
    category: 'outros',
    type: 'ambient',
    icon: '🧩',
    description: 'Concentração e mistério para resolução de charadas e puzzles',
    isLoop: true
  },
  {
    id: 'musica_feliz',
    name: 'Música Feliz',
    storagePath: 'sons/Musica feliz.mp3',
    category: 'outros',
    type: 'ambient',
    icon: '🎉',
    description: 'Melodia alegre de celebração, comemoração e triunfo',
    isLoop: true
  },
  {
    id: 'fogo',
    name: 'Fogo',
    storagePath: 'sons/fogo.mp3',
    category: 'outros',
    type: 'sfx',
    icon: '🔥',
    description: 'Estalo de brasas e efeito sonoro de labaredas ardentes',
    isLoop: false
  }
];

export const CATEGORY_CONFIG: Record<SoundCategory, { label: string; icon: string; color: string }> = {
  ambientes: { label: 'Ambientes', icon: '🌲', color: 'border-emerald-600/60 text-emerald-300' },
  combate: { label: 'Combate', icon: '⚔️', color: 'border-red-600/60 text-red-300' },
  outros: { label: 'Outros', icon: '✨', color: 'border-amber-600/60 text-amber-300' }
};

// Cache em memória de URLs do Firebase Storage
const resolvedUrlCache = new Map<string, string>();

/**
 * Resolve a URL direta do arquivo no Firebase Storage usando estritamente o caminho físico mapeado.
 */
export async function resolveFirebaseStorageSoundUrl(sound: ThematicSound): Promise<string> {
  if (sound.resolvedUrl) return sound.resolvedUrl;
  if (resolvedUrlCache.has(sound.id)) {
    const cached = resolvedUrlCache.get(sound.id)!;
    sound.resolvedUrl = cached;
    return cached;
  }

  // 1. Tenta getDownloadURL direto no caminho físico exato
  try {
    const fileRef = ref(storage, sound.storagePath);
    const url = await getDownloadURL(fileRef);
    if (url) {
      resolvedUrlCache.set(sound.id, url);
      sound.resolvedUrl = url;
      return url;
    }
  } catch (err) {
    console.warn(`[AudioService] Tentando fallback para caminho '${sound.storagePath}':`, err);
  }

  // 2. Fallback resiliente usando resolveStorageUrlWithFallback
  try {
    const url = await resolveStorageUrlWithFallback(sound.storagePath);
    if (url) {
      resolvedUrlCache.set(sound.id, url);
      sound.resolvedUrl = url;
      return url;
    }
  } catch (err: any) {
    console.error(`[AudioService] Erro ao resolver URL para '${sound.name}' (${sound.storagePath}):`, err);
  }

  throw new Error(`Arquivo não encontrado no Firebase Storage: '${sound.storagePath}'`);
}

const BROADCAST_CHANNEL_NAME = 'realmor_audio_sync_channel';
const LOCAL_STORAGE_KEY = 'realmor_active_audio_state';

let localBroadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    localBroadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch (e) {}

class AudioEngine {
  private currentAmbientAudio: HTMLAudioElement | null = null;
  private currentAmbientSoundId: string | null = null;
  private isAmbientPaused: boolean = false;
  private masterVolume: number = 0.7;

  private audioInstancesCache = new Map<string, HTMLAudioElement>();
  private loadingTimeoutTimers = new Map<string, NodeJS.Timeout>();

  private statusBySoundId: Record<string, SoundPlayState> = {};
  private errorBySoundId: Record<string, string> = {};
  private loopBySoundId: Record<string, boolean> = {};
  private activeSfxAudios: Set<HTMLAudioElement> = new Set();
  private listeners: Set<(state: AudioEngineState) => void> = new Set();

  constructor() {
    THEMATIC_SOUNDS.forEach(s => {
      this.loopBySoundId[s.id] = s.isLoop;
    });

    if (localBroadcastChannel) {
      localBroadcastChannel.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'audio_sync') {
          this.handleRemotePayload(event.data.payload as AudioSyncPayload);
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
          try {
            const payload = JSON.parse(e.newValue) as AudioSyncPayload;
            this.handleRemotePayload(payload);
          } catch (err) {}
        }
      });
    }
  }

  public getActiveState(): AudioEngineState {
    return {
      activeAmbientSoundId: this.currentAmbientSoundId,
      isAmbientPlaying: Boolean(this.currentAmbientAudio && !this.isAmbientPaused && !this.currentAmbientAudio.paused),
      isAmbientPaused: this.isAmbientPaused,
      volume: this.masterVolume,
      statusBySoundId: { ...this.statusBySoundId },
      errorBySoundId: { ...this.errorBySoundId },
      loopBySoundId: { ...this.loopBySoundId }
    };
  }

  public subscribe(cb: (state: AudioEngineState) => void): () => void {
    this.listeners.add(cb);
    cb(this.getActiveState());
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const st = this.getActiveState();
    this.listeners.forEach(cb => {
      try { cb(st); } catch (e) {}
    });
  }

  public toggleLoop(soundId: string) {
    const current = this.loopBySoundId[soundId] ?? true;
    const next = !current;
    this.loopBySoundId[soundId] = next;

    const cachedAudio = this.audioInstancesCache.get(soundId);
    if (cachedAudio) {
      cachedAudio.loop = next;
    }
    if (this.currentAmbientSoundId === soundId && this.currentAmbientAudio) {
      this.currentAmbientAudio.loop = next;
    }
    this.notify();
  }

  public setVolume(volume: number, broadcast: boolean = true, campaignId?: string, gameId?: string) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.currentAmbientAudio) {
      this.currentAmbientAudio.volume = this.masterVolume;
    }
    this.audioInstancesCache.forEach(audio => {
      try { audio.volume = this.masterVolume; } catch (e) {}
    });
    this.activeSfxAudios.forEach(a => {
      try { a.volume = this.masterVolume; } catch (e) {}
    });
    this.notify();

    if (broadcast) {
      this.broadcastPayload({
        action: 'set_volume',
        volume: this.masterVolume,
        timestamp: Date.now()
      }, campaignId, gameId);
    }
  }

  private getOrCreateAudioElement(soundId: string, url: string, isLoop: boolean): HTMLAudioElement {
    if (this.audioInstancesCache.has(soundId)) {
      const existing = this.audioInstancesCache.get(soundId)!;
      existing.loop = isLoop;
      existing.volume = this.masterVolume;
      if (existing.src !== url) {
        existing.src = url;
      }
      return existing;
    }

    const audio = new Audio();
    audio.preload = 'metadata'; // Streaming progressivo
    audio.crossOrigin = 'anonymous';
    audio.loop = isLoop;
    audio.volume = this.masterVolume;
    audio.src = url;

    const isWav = url.toLowerCase().includes('.wav');
    const mimeType = isWav ? 'audio/wav' : 'audio/mpeg';
    const canPlay = audio.canPlayType(mimeType);

    if (canPlay === '') {
      console.warn(`[AudioEngine] Verificação de codec: Navegador reportou suporte limitado a ${mimeType}`);
    }

    audio.addEventListener('playing', () => {
      this.clearLoadingTimeout(soundId);
      this.statusBySoundId[soundId] = 'playing';
      delete this.errorBySoundId[soundId];
      this.notify();
    });

    audio.addEventListener('canplay', () => {
      if (this.statusBySoundId[soundId] === 'loading') {
        this.clearLoadingTimeout(soundId);
      }
    });

    audio.addEventListener('error', () => {
      this.clearLoadingTimeout(soundId);
      const code = audio.error?.code;
      const msg = audio.error?.message;
      console.error(`[AudioEngine] Erro no áudio (${soundId}): Code ${code} - ${msg}`);

      this.statusBySoundId[soundId] = 'error';
      this.errorBySoundId[soundId] = msg || 'Erro ao carregar áudio';
      if (this.currentAmbientAudio === audio) {
        this.currentAmbientAudio = null;
        this.currentAmbientSoundId = null;
      }
      this.notify();
    });

    this.audioInstancesCache.set(soundId, audio);
    return audio;
  }

  private startLoadingTimeout(soundId: string, soundName: string, audio: HTMLAudioElement) {
    this.clearLoadingTimeout(soundId);

    const timer = setTimeout(() => {
      console.error(`[AudioEngine] Timeout de 10s excedido para '${soundName}'`);
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch (e) {}

      this.statusBySoundId[soundId] = 'error';
      this.errorBySoundId[soundId] = 'Tempo limite de carregamento excedido (10s)';
      if (this.currentAmbientAudio === audio) {
        this.currentAmbientAudio = null;
        this.currentAmbientSoundId = null;
      }
      this.notify();
    }, 10000);

    this.loadingTimeoutTimers.set(soundId, timer);
  }

  private clearLoadingTimeout(soundId: string) {
    if (this.loadingTimeoutTimers.has(soundId)) {
      clearTimeout(this.loadingTimeoutTimers.get(soundId)!);
      this.loadingTimeoutTimers.delete(soundId);
    }
  }

  public async playSound(sound: ThematicSound, broadcast: boolean = true, campaignId?: string, gameId?: string) {
    if (sound.type === 'ambient') {
      if (this.currentAmbientSoundId === sound.id && this.isAmbientPaused && this.currentAmbientAudio) {
        this.resumeAmbient(broadcast, campaignId, gameId);
        return;
      }

      if (this.currentAmbientAudio && this.currentAmbientAudio !== this.audioInstancesCache.get(sound.id)) {
        try {
          this.currentAmbientAudio.pause();
        } catch (e) {}
      }

      this.currentAmbientSoundId = sound.id;
      this.isAmbientPaused = false;
      this.statusBySoundId[sound.id] = 'loading';
      delete this.errorBySoundId[sound.id];
      this.notify();

      try {
        const audioUrl = await resolveFirebaseStorageSoundUrl(sound);
        const shouldLoop = this.loopBySoundId[sound.id] ?? sound.isLoop;

        const audio = this.getOrCreateAudioElement(sound.id, audioUrl, shouldLoop);
        this.currentAmbientAudio = audio;

        this.startLoadingTimeout(sound.id, sound.name, audio);

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.clearLoadingTimeout(sound.id);
              this.statusBySoundId[sound.id] = 'playing';
              delete this.errorBySoundId[sound.id];
              this.notify();
            })
            .catch((err) => {
              this.clearLoadingTimeout(sound.id);
              console.error(`[AudioEngine] Reprodução não iniciada para '${sound.name}':`, err);
              this.statusBySoundId[sound.id] = 'error';
              this.errorBySoundId[sound.id] = err?.message || 'Reprodução bloqueada pelo navegador';
              this.notify();
            });
        }

        if (broadcast) {
          this.broadcastPayload({
            action: 'play_ambient',
            soundId: sound.id,
            soundName: sound.name,
            category: sound.category,
            soundType: sound.type,
            url: audioUrl,
            isLoop: shouldLoop,
            volume: this.masterVolume,
            timestamp: Date.now()
          }, campaignId, gameId);
        }
      } catch (err: any) {
        this.clearLoadingTimeout(sound.id);
        console.error(`[AudioEngine] Erro ao carregar '${sound.storagePath}':`, err);
        this.statusBySoundId[sound.id] = 'error';
        this.errorBySoundId[sound.id] = err?.message || 'Arquivo não encontrado no Storage';
        this.currentAmbientAudio = null;
        this.currentAmbientSoundId = null;
        this.notify();
      }
    } else {
      this.statusBySoundId[sound.id] = 'loading';
      delete this.errorBySoundId[sound.id];
      this.notify();

      try {
        const audioUrl = await resolveFirebaseStorageSoundUrl(sound);
        const sfx = this.getOrCreateAudioElement(sound.id, audioUrl, false);
        this.activeSfxAudios.add(sfx);

        this.startLoadingTimeout(sound.id, sound.name, sfx);

        sfx.currentTime = 0;

        const onEnded = () => {
          this.activeSfxAudios.delete(sfx);
          this.statusBySoundId[sound.id] = 'idle';
          this.notify();
          sfx.removeEventListener('ended', onEnded);
        };
        sfx.addEventListener('ended', onEnded);

        const sfxPromise = sfx.play();
        if (sfxPromise !== undefined) {
          sfxPromise
            .then(() => {
              this.clearLoadingTimeout(sound.id);
              this.statusBySoundId[sound.id] = 'playing';
              this.notify();
            })
            .catch((err) => {
              this.clearLoadingTimeout(sound.id);
              console.error(`[AudioEngine] Erro ao reproduzir SFX '${sound.name}':`, err);
              this.activeSfxAudios.delete(sfx);
              this.statusBySoundId[sound.id] = 'error';
              this.errorBySoundId[sound.id] = err?.message || 'Reprodução bloqueada';
              this.notify();
            });
        }

        if (broadcast) {
          this.broadcastPayload({
            action: 'play_sfx',
            soundId: sound.id,
            soundName: sound.name,
            category: sound.category,
            soundType: sound.type,
            url: audioUrl,
            volume: this.masterVolume,
            timestamp: Date.now()
          }, campaignId, gameId);
        }
      } catch (err: any) {
        this.clearLoadingTimeout(sound.id);
        console.error(`[AudioEngine] Erro ao localizar SFX '${sound.storagePath}':`, err);
        this.statusBySoundId[sound.id] = 'error';
        this.errorBySoundId[sound.id] = err?.message || 'SFX não encontrado no Storage';
        this.notify();
      }
    }
  }

  public pauseAmbient(broadcast: boolean = true, campaignId?: string, gameId?: string) {
    if (this.currentAmbientAudio && !this.currentAmbientAudio.paused) {
      try {
        this.currentAmbientAudio.pause();
        this.isAmbientPaused = true;
        if (this.currentAmbientSoundId) {
          this.statusBySoundId[this.currentAmbientSoundId] = 'idle';
        }
        this.notify();
      } catch (e) {}

      if (broadcast) {
        this.broadcastPayload({
          action: 'pause_ambient',
          volume: this.masterVolume,
          timestamp: Date.now()
        }, campaignId, gameId);
      }
    }
  }

  public resumeAmbient(broadcast: boolean = true, campaignId?: string, gameId?: string) {
    if (this.currentAmbientAudio && this.isAmbientPaused) {
      try {
        this.currentAmbientAudio.play().then(() => {
          this.isAmbientPaused = false;
          if (this.currentAmbientSoundId) {
            this.statusBySoundId[this.currentAmbientSoundId] = 'playing';
          }
          this.notify();
        }).catch(() => {});
      } catch (e) {}

      if (broadcast) {
        this.broadcastPayload({
          action: 'resume_ambient',
          volume: this.masterVolume,
          timestamp: Date.now()
        }, campaignId, gameId);
      }
    }
  }

  public stopAmbient(broadcast: boolean = true, campaignId?: string, gameId?: string) {
    if (this.currentAmbientAudio) {
      try {
        this.currentAmbientAudio.pause();
        this.currentAmbientAudio.currentTime = 0;
      } catch (e) {}
      this.currentAmbientAudio = null;
    }
    if (this.currentAmbientSoundId) {
      this.clearLoadingTimeout(this.currentAmbientSoundId);
      this.statusBySoundId[this.currentAmbientSoundId] = 'idle';
    }
    this.currentAmbientSoundId = null;
    this.isAmbientPaused = false;
    this.notify();

    if (broadcast) {
      this.broadcastPayload({
        action: 'stop_ambient',
        volume: this.masterVolume,
        timestamp: Date.now()
      }, campaignId, gameId);
    }
  }

  public stopAll(broadcast: boolean = true, campaignId?: string, gameId?: string) {
    this.stopAmbient(false);
    this.activeSfxAudios.forEach(sfx => {
      try {
        sfx.pause();
        sfx.currentTime = 0;
      } catch (e) {}
    });
    this.activeSfxAudios.clear();
    
    THEMATIC_SOUNDS.forEach(s => {
      this.clearLoadingTimeout(s.id);
      this.statusBySoundId[s.id] = 'idle';
    });
    this.notify();

    if (broadcast) {
      this.broadcastPayload({
        action: 'stop_all',
        volume: this.masterVolume,
        timestamp: Date.now()
      }, campaignId, gameId);
    }
  }

  public handleRemotePayload(payload: AudioSyncPayload) {
    if (!payload || !payload.action) return;

    if (payload.action === 'set_volume') {
      this.setVolume(payload.volume, false);
    } else if (payload.action === 'pause_ambient') {
      this.pauseAmbient(false);
    } else if (payload.action === 'resume_ambient') {
      this.resumeAmbient(false);
    } else if (payload.action === 'stop_ambient') {
      this.stopAmbient(false);
    } else if (payload.action === 'stop_all') {
      this.stopAll(false);
    } else if (payload.action === 'play_ambient' && payload.soundId) {
      const sound = THEMATIC_SOUNDS.find(s => s.id === payload.soundId);
      if (sound) {
        if (payload.url) sound.resolvedUrl = payload.url;
        this.playSound(sound, false);
      } else if (payload.url) {
        this.playSound({
          id: payload.soundId,
          name: payload.soundName || 'Som Ambiente',
          storagePath: payload.soundName || 'sons/Som Ambiente.mp3',
          category: payload.category || 'ambientes',
          type: 'ambient',
          icon: '🔊',
          description: '',
          isLoop: payload.isLoop ?? true,
          resolvedUrl: payload.url
        }, false);
      }
    } else if (payload.action === 'play_sfx' && payload.soundId) {
      const sound = THEMATIC_SOUNDS.find(s => s.id === payload.soundId);
      if (sound) {
        if (payload.url) sound.resolvedUrl = payload.url;
        this.playSound(sound, false);
      } else if (payload.url) {
        this.playSound({
          id: payload.soundId,
          name: payload.soundName || 'Efeito Sonoro',
          storagePath: payload.soundName || 'sons/Efeito Sonoro.mp3',
          category: payload.category || 'outros',
          type: 'sfx',
          icon: '💥',
          description: '',
          isLoop: false,
          resolvedUrl: payload.url
        }, false);
      }
    }
  }

  private async broadcastPayload(payload: AudioSyncPayload, campaignId?: string, gameId?: string) {
    try {
      if (localBroadcastChannel) {
        localBroadcastChannel.postMessage({
          type: 'audio_sync',
          payload
        });
      }
    } catch (e) {}

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}

    if (campaignId && gameId) {
      try {
        const audioDocRef = doc(db, 'campaigns', campaignId, 'games', gameId, 'sessionState', 'audio');
        await setDoc(audioDocRef, {
          ...payload,
          serverTimestamp: serverTimestamp()
        }, { merge: true });
      } catch (err: any) {
        try {
          const globalAudioDoc = doc(db, 'test_tv_sync', 'audio');
          await setDoc(globalAudioDoc, {
            ...payload,
            serverTimestamp: serverTimestamp()
          }, { merge: true });
        } catch (e) {}
      }
    } else {
      try {
        const globalAudioDoc = doc(db, 'test_tv_sync', 'audio');
        await setDoc(globalAudioDoc, {
          ...payload,
          serverTimestamp: serverTimestamp()
        }, { merge: true });
      } catch (e) {}
    }
  }
}

export const AudioService = new AudioEngine();

export function subscribeToSessionAudio(
  campaignId?: string,
  gameId?: string,
  onEvent?: (payload: AudioSyncPayload) => void
): () => void {
  const unsubLocal = AudioService.subscribe(() => {});

  let unsubFirestore = () => {};

  if (campaignId && gameId) {
    try {
      const audioDocRef = doc(db, 'campaigns', campaignId, 'games', gameId, 'sessionState', 'audio');
      unsubFirestore = onSnapshot(audioDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as AudioSyncPayload;
          if (data && data.timestamp && Date.now() - data.timestamp < 15000) {
            AudioService.handleRemotePayload(data);
            onEvent?.(data);
          }
        }
      }, () => {});
    } catch (e) {}
  } else {
    try {
      const globalAudioDoc = doc(db, 'test_tv_sync', 'audio');
      unsubFirestore = onSnapshot(globalAudioDoc, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as AudioSyncPayload;
          if (data && data.timestamp && Date.now() - data.timestamp < 15000) {
            AudioService.handleRemotePayload(data);
            onEvent?.(data);
          }
        }
      }, () => {});
    } catch (e) {}
  }

  return () => {
    unsubLocal();
    unsubFirestore();
  };
}
