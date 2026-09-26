import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Square, 
  Play, 
  Pause, 
  Search, 
  Disc3, 
  X,
  Loader2,
  AlertCircle,
  FileAudio
} from 'lucide-react';
import { 
  AudioService, 
  THEMATIC_SOUNDS, 
  ThematicSound, 
  SoundCategory, 
  CATEGORY_CONFIG,
  AudioEngineState 
} from '../../services/audioService';

interface MapSoundsPanelProps {
  campaignId?: string;
  gameId?: string;
  onClose?: () => void;
}

export const MapSoundsPanel: React.FC<MapSoundsPanelProps> = ({
  campaignId,
  gameId,
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState<SoundCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [audioState, setAudioState] = useState<AudioEngineState>(() => AudioService.getActiveState());

  useEffect(() => {
    const unsub = AudioService.subscribe((state) => {
      setAudioState(state);
    });
    return () => unsub();
  }, []);

  const activeAmbientSound = THEMATIC_SOUNDS.find(s => s.id === audioState.activeAmbientSoundId);

  const filteredSounds = THEMATIC_SOUNDS.filter(s => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch = !searchTerm || 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.storagePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTogglePlay = (sound: ThematicSound) => {
    if (sound.type === 'ambient') {
      if (audioState.activeAmbientSoundId === sound.id) {
        if (audioState.isAmbientPlaying) {
          AudioService.pauseAmbient(true, campaignId, gameId);
        } else if (audioState.isAmbientPaused) {
          AudioService.resumeAmbient(true, campaignId, gameId);
        } else {
          AudioService.playSound(sound, true, campaignId, gameId);
        }
      } else {
        AudioService.playSound(sound, true, campaignId, gameId);
      }
    } else {
      // SFX toca uma vez
      AudioService.playSound(sound, true, campaignId, gameId);
    }
  };

  const handleStopAll = () => {
    AudioService.stopAll(true, campaignId, gameId);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    AudioService.setVolume(val, true, campaignId, gameId);
  };

  return (
    <div className="flex flex-col h-full space-y-3 select-none text-stone-200">
      {/* 1. Cabeçalho do Painel */}
      <div className="flex items-center justify-between pb-2 border-b border-amber-900/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-950/70 border border-amber-600/50 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Volume2 size={15} />
          </div>
          <div>
            <h3 className="font-cinzel text-xs font-black text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>ÁUDIO DA SESSÃO</span>
              {audioState.isAmbientPlaying && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </h3>
            <p className="text-[10px] text-stone-400 font-sans flex items-center gap-1">
              <FileAudio size={11} className="text-amber-500/80" />
              <span>Firebase Storage (sons/)</span>
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-stone-400 hover:text-amber-200 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 2. Barra de Status do Som Ativo & Controles Gerais */}
      <div className="p-2.5 rounded-xl bg-stone-950/90 border border-amber-900/50 space-y-2 shadow-inner">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 truncate pr-2">
            {audioState.isAmbientPlaying && activeAmbientSound ? (
              <>
                <Disc3 size={14} className="text-amber-400 animate-spin shrink-0" />
                <span className="font-cinzel font-bold text-amber-300 truncate">
                  {activeAmbientSound.icon} {activeAmbientSound.name}
                </span>
              </>
            ) : audioState.isAmbientPaused && activeAmbientSound ? (
              <>
                <Pause size={14} className="text-amber-500 shrink-0" />
                <span className="font-cinzel font-bold text-amber-500/90 truncate">
                  {activeAmbientSound.icon} {activeAmbientSound.name}
                </span>
              </>
            ) : (
              <span className="font-cinzel text-stone-500 italic text-[10px]">
                Nenhum ambiente ativo
              </span>
            )}
          </div>

          {(audioState.isAmbientPlaying || audioState.isAmbientPaused) && (
            <div className="flex items-center gap-1.5 shrink-0">
              {audioState.isAmbientPaused ? (
                <button
                  type="button"
                  onClick={() => AudioService.resumeAmbient(true, campaignId, gameId)}
                  className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-[10px] font-cinzel font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="Retomar som ambiente"
                >
                  <Play size={10} className="fill-emerald-400" />
                  <span>RETOMAR</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => AudioService.pauseAmbient(true, campaignId, gameId)}
                  className="px-2 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-[10px] font-cinzel font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="Pausar som ambiente"
                >
                  <Pause size={10} className="fill-amber-400" />
                  <span>PAUSAR</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleStopAll}
                className="px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 text-[10px] font-cinzel font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                title="Parar todos os sons"
              >
                <Square size={9} className="fill-red-400" />
                <span>PARAR</span>
              </button>
            </div>
          )}
        </div>

        {/* Slider de Volume */}
        <div className="flex items-center gap-2 pt-1 border-t border-stone-800/60">
          <Volume2 size={13} className="text-amber-400/80 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={audioState.volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            title="Volume Geral"
          />
          <span className="text-[10px] font-mono text-amber-400/90 font-bold min-w-[30px] text-right">
            {Math.round(audioState.volume * 100)}%
          </span>
        </div>
      </div>

      {/* 3. Busca Rápida */}
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500/60" />
        <input
          type="text"
          placeholder="Buscar sons (ex: floresta, confronto, boss, fogo)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-stone-950/90 border border-amber-900/40 text-stone-200 placeholder-stone-600 text-xs font-sans focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* 4. Categorias (🌲 Ambientes, ⚔️ Combate, ✨ Outros) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-amber-900/40 shrink-0">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-2 py-1 rounded-md text-[10px] font-cinzel font-bold whitespace-nowrap transition-all cursor-pointer border ${
            activeCategory === 'all'
              ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
              : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-850'
          }`}
        >
          🌟 Todos (17)
        </button>

        {(Object.keys(CATEGORY_CONFIG) as SoundCategory[]).map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const isSelected = activeCategory === cat;
          const count = THEMATIC_SOUNDS.filter(s => s.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-1 rounded-md text-[10px] font-cinzel font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              {cfg.icon} {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 5. Lista de Sons (Cards Limpos e Compactos) */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-amber-900/40">
        {filteredSounds.length === 0 ? (
          <div className="p-4 text-center text-stone-500 text-xs italic font-cinzel">
            Nenhum som encontrado para este filtro.
          </div>
        ) : (
          filteredSounds.map((sound) => {
            const status = audioState.statusBySoundId[sound.id] || 'idle';
            const errorMessage = audioState.errorBySoundId[sound.id];
            const isAmbientCurrent = audioState.activeAmbientSoundId === sound.id;
            const isPlayingThis = sound.type === 'ambient' 
              ? (isAmbientCurrent && audioState.isAmbientPlaying)
              : (status === 'playing');
            const isPausedThis = sound.type === 'ambient' && isAmbientCurrent && audioState.isAmbientPaused;
            const isLoadingThis = status === 'loading';
            const isErrorThis = status === 'error';

            return (
              <div
                key={sound.id}
                onClick={() => handleTogglePlay(sound)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between group ${
                  isPlayingThis
                    ? 'bg-amber-950/60 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : isPausedThis
                    ? 'bg-amber-950/30 border-amber-600/40'
                    : isErrorThis
                    ? 'bg-red-950/40 border-red-800/60'
                    : 'bg-stone-900/70 hover:bg-stone-850 border-amber-950/40 hover:border-amber-700/50'
                }`}
              >
                {/* Lado Esquerdo: Ícone + Nome Limpo + Descrição */}
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border transition-all ${
                    isPlayingThis 
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300' 
                      : isErrorThis
                      ? 'bg-red-950 border-red-700 text-red-400'
                      : 'bg-stone-950 border-stone-800 text-stone-300 group-hover:border-amber-900/60'
                  }`}>
                    {isLoadingThis ? (
                      <Loader2 size={14} className="animate-spin text-amber-400" />
                    ) : isErrorThis ? (
                      <AlertCircle size={14} className="text-red-400" />
                    ) : (
                      sound.icon
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className={`text-xs font-cinzel font-bold block truncate transition-colors ${
                      isPlayingThis ? 'text-amber-200' : isErrorThis ? 'text-red-300' : 'text-stone-200 group-hover:text-amber-300'
                    }`}>
                      {sound.name}
                    </span>

                    <p className="text-[10px] font-sans text-stone-400 truncate">
                      {isErrorThis ? (errorMessage || 'Arquivo não encontrado em sons/') : sound.description}
                    </p>
                  </div>
                </div>

                {/* Lado Direito: Botão Play/Pause Único e Limpo */}
                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlay(sound);
                    }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                      isPlayingThis
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                        : isPausedThis
                        ? 'bg-amber-950 text-amber-300 border-amber-600 hover:bg-amber-900'
                        : isErrorThis
                        ? 'bg-red-900/60 text-red-200 border-red-700 hover:bg-red-800'
                        : 'bg-stone-950/90 text-amber-400 hover:text-amber-200 hover:bg-stone-800 border-amber-900/50'
                    }`}
                    title={
                      isPlayingThis ? 'Pausar som' : 
                      isPausedThis ? 'Retomar som' : 
                      isErrorThis ? 'Tentar novamente' : 'Reproduzir som'
                    }
                  >
                    {isLoadingThis ? (
                      <Loader2 size={13} className="animate-spin text-amber-400" />
                    ) : isPlayingThis ? (
                      <Pause size={13} className="fill-stone-950" />
                    ) : (
                      <Play size={13} className="fill-amber-400 ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Rodapé */}
      <div className="pt-2 border-t border-amber-900/30 text-[9px] font-cinzel text-stone-400 text-center flex flex-col items-center gap-0.5">
        <div className="flex items-center justify-center gap-1.5 text-stone-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sincronizado em tempo real com Jogadores e TV</span>
        </div>
      </div>
    </div>
  );
};
