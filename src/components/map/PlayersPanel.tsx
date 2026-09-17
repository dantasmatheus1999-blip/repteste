import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Users, 
  Sword, 
  Wand2, 
  Target, 
  Sparkles, 
  Heart, 
  Droplet, 
  ChevronRight, 
  ChevronLeft,
  ShieldAlert,
  User,
  Crown
} from 'lucide-react';
import { GamePlayer } from '../../types/game';
import { GameService } from '../../services/gameService';
import { CharacterService } from '../../services/characterService';
import { normalizeCharacterSheet } from '../../utils/sheetCalculations';
import { MasterPlayerControlModal } from './MasterPlayerControlModal';

interface PlayersPanelProps {
  campaignId?: string;
  gameId?: string;
  isMaster?: boolean;
}

export const PlayersPanel: React.FC<PlayersPanelProps> = ({
  campaignId,
  gameId,
  isMaster = true
}) => {
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [characters, setCharacters] = useState<Record<string, any>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<GamePlayer | null>(null);

  // Debounce refs para otimização de writes no Firestore (500–1000ms)
  const pendingUpdatesRef = useRef<Record<string, Record<string, any>>>({});
  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // 1. Inscrição em tempo real aos jogadores da mesa via GameService
  useEffect(() => {
    if (!campaignId || !gameId) {
      setPlayers([]);
      return;
    }

    const unsubscribe = GameService.subscribeToGamePlayers(campaignId, gameId, (playersList) => {
      // Filtra apenas jogadores aventureiros (excluindo mestre se houver)
      const adventurers = playersList.filter(p => p.role === 'player');
      setPlayers(adventurers);
    });

    return () => {
      unsubscribe();
    };
  }, [campaignId, gameId]);

  // 2. Inscrição em tempo real às fichas de cada personagem dos jogadores
  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    players.forEach((p) => {
      if (p.characterId) {
        const unsub = CharacterService.subscribeToCharacter(p.characterId, (charData) => {
          if (charData) {
            setCharacters((prev) => ({
              ...prev,
              [charData.id]: charData
            }));
          }
        });
        unsubscribers.push(unsub);
      }
    });

    return () => {
      unsubscribers.forEach(u => u());
    };
  }, [players]);

  // 3. Atualização agrupada de personagem com debounce de 600ms (Regra de Ouro: Estabilidade + Baixo Consumo)
  const handleUpdateCharacter = useCallback((charId: string, partial: Record<string, any>) => {
    if (!charId) return;

    // Atualização otimista imediata na UI local
    setCharacters((prev) => {
      const current = prev[charId] || {};
      return {
        ...prev,
        [charId]: { ...current, ...partial }
      };
    });

    // Enfileira alterações pendentes
    pendingUpdatesRef.current[charId] = {
      ...(pendingUpdatesRef.current[charId] || {}),
      ...partial
    };

    // Cancela timer anterior se houver novos cliques rápidos
    if (saveTimeoutRef.current[charId]) {
      clearTimeout(saveTimeoutRef.current[charId]);
    }

    // Dispara gravação única após 600ms de inatividade
    saveTimeoutRef.current[charId] = setTimeout(async () => {
      const payload = { ...pendingUpdatesRef.current[charId] };
      delete pendingUpdatesRef.current[charId];
      try {
        await CharacterService.updateCharacter(charId, payload);
      } catch (err) {
        console.error(`[PlayersPanel] Falha ao salvar alterações do personagem ${charId}:`, err);
      }
    }, 600);
  }, []);

  const getClassIcon = (clsName?: string) => {
    const name = (clsName || '').toLowerCase();
    if (name.includes('guerreiro') || name.includes('barbaro') || name.includes('paladino') || name.includes('cavaleiro')) return Sword;
    if (name.includes('mago') || name.includes('arcanista') || name.includes('bruxo') || name.includes('bardo')) return Wand2;
    if (name.includes('cacador') || name.includes('patrulheiro') || name.includes('ladino')) return Target;
    return Sparkles;
  };

  const selectedCharacter = selectedPlayer?.characterId ? characters[selectedPlayer.characterId] : null;

  return (
    <>
      <aside 
        id="map-right-players-panel"
        className={`h-full bg-stone-950/95 border-l border-amber-900/40 flex flex-col shrink-0 select-none z-20 shadow-[-4px_0_15px_rgba(0,0,0,0.5)] transition-all duration-200 relative ${
          isCollapsed ? 'w-11' : 'w-56 sm:w-60 lg:w-64'
        }`}
        style={{
          backgroundImage: 'radial-gradient(ellipse at top right, rgba(217, 119, 6, 0.05) 0%, transparent 70%)'
        }}
      >
        {/* Botão de Recolher/Expandir */}
        <button
          type="button"
          onClick={() => setIsCollapsed(prev => !prev)}
          className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-stone-900 border border-amber-700/60 text-amber-400 flex items-center justify-center hover:bg-amber-950 transition-colors shadow-md z-30 cursor-pointer"
          title={isCollapsed ? 'Expandir Jogadores' : 'Recolher Painel'}
        >
          {isCollapsed ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
        </button>

        {/* ============================================================ */}
        {/* CONTEÚDO QUANDO RECOLHIDO                                   */}
        {/* ============================================================ */}
        {isCollapsed ? (
          <div className="flex flex-col items-center py-4 space-y-5">
            <div className="text-amber-400" title="Jogadores">
              <Users size={18} />
            </div>

            <div className="flex flex-col items-center gap-3">
              {players.map(p => {
                const char = p.characterId ? characters[p.characterId] : null;
                const avatar = p.characterAvatar || char?.imageUrl || '';
                const name = char?.name || p.characterName || p.displayName;
                const isOnline = p.status === 'online';

                return (
                  <button 
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlayer(p)}
                    className="w-8 h-8 rounded-full bg-stone-900 border border-amber-900/50 flex items-center justify-center text-xs font-bold text-amber-300 relative group cursor-pointer hover:border-amber-500 transition-all overflow-visible"
                    title={`${name} (${p.displayName}) - Clique para controlar`}
                  >
                    {avatar ? (
                      <img 
                        src={avatar} 
                        alt={name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full" 
                      />
                    ) : (
                      <span>{name[0]}</span>
                    )}

                    {/* Status Dot */}
                    <span 
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-stone-950 ${
                        isOnline ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : p.status === 'waiting' ? 'bg-amber-400' : 'bg-stone-500'
                      }`} 
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* CONTEÚDO NORMAL EXPANDIDO                                   */
          /* ============================================================ */
          <div className="flex flex-col h-full overflow-hidden">
            {/* Cabeçalho do Painel */}
            <div className="p-3.5 border-b border-amber-900/30 flex items-center justify-between bg-stone-950/90">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-amber-400" />
                <h3 className="font-cinzel font-bold text-xs uppercase tracking-widest text-amber-200">
                  JOGADORES
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-400 font-bold">
                {players.filter(p => p.status === 'online').length}/{players.length} ON
              </span>
            </div>

            {/* Lista de Aventureiros Reais da Partida */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
              {players.length === 0 ? (
                <div className="p-4 text-center space-y-2 rounded-xl bg-stone-900/30 border border-stone-800/60 my-4">
                  <User size={24} className="mx-auto text-stone-600 stroke-1" />
                  <p className="text-xs font-cinzel text-stone-400">
                    Aguardando aventureiros entrarem na mesa...
                  </p>
                </div>
              ) : (
                players.map((p) => {
                  const rawChar = p.characterId ? characters[p.characterId] : null;
                  const normalized = rawChar ? normalizeCharacterSheet(rawChar, p.characterId || '') : null;

                  const charName = normalized?.name || p.characterName || 'Personagem';
                  const className = normalized?.className || p.characterClass || 'Aventureiro';
                  const level = normalized?.level || p.characterLevel || 1;
                  const avatarUrl = p.characterAvatar || normalized?.imageUrl || rawChar?.imageUrl || '';

                  const currentPV = normalized?.currentPV ?? (rawChar?.currentPV !== undefined ? Number(rawChar.currentPV) : 20);
                  const maxPV = normalized?.maxPV || 20;

                  const currentPM = normalized?.currentPM ?? (rawChar?.currentPM !== undefined ? Number(rawChar.currentPM) : 10);
                  const maxPM = normalized?.maxPM || 10;

                  const conditions = normalized?.conditions || rawChar?.conditions || [];

                  const hpPercent = Math.min(100, Math.max(0, Math.round((currentPV / Math.max(1, maxPV)) * 100)));
                  const pmPercent = Math.min(100, Math.max(0, Math.round((currentPM / Math.max(1, maxPM)) * 100)));

                  const Icon = getClassIcon(className);
                  const isOnline = p.status === 'online';

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlayer(p)}
                      className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/30 hover:border-amber-600/70 transition-all space-y-2 shadow-sm group cursor-pointer hover:bg-stone-900"
                    >
                      {/* Topo do Card: [ FOTO ] Nome, Classe, Nível, Status */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Foto do Personagem / Jogador */}
                          <div className="w-9 h-9 rounded-lg bg-stone-950 border border-amber-900/60 overflow-hidden flex items-center justify-center text-amber-400 shrink-0 shadow">
                            {avatarUrl ? (
                              <img 
                                src={avatarUrl} 
                                alt={charName} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              />
                            ) : (
                              <Icon size={18} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-cinzel font-bold text-xs text-amber-100 truncate group-hover:text-amber-300 transition-colors">
                              {charName}
                            </p>
                            <p className="text-[10px] text-stone-400 truncate">
                              {className} • Nv. {level}
                            </p>
                            <p className="text-[9px] text-stone-500 truncate font-sans">
                              {p.displayName}
                            </p>
                          </div>
                        </div>

                        {/* Indicador de Status: 🟢 Online / ⚪ Offline */}
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <span 
                            className={`w-2 h-2 rounded-full ${
                              isOnline
                                ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse'
                                : p.status === 'waiting'
                                ? 'bg-amber-400'
                                : 'bg-stone-600'
                            }`} 
                          />
                          <span className="text-[9px] font-cinzel text-stone-400 uppercase">
                            {isOnline ? 'Online' : p.status === 'waiting' ? 'Espera' : 'Off'}
                          </span>
                        </div>
                      </div>

                      {/* Barras de Recursos: ❤️ PV e 💧 PM */}
                      <div className="space-y-1.5 pt-1 border-t border-stone-800/60">
                        {/* Barra de PV */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[10px] font-mono leading-tight">
                            <span className="flex items-center gap-1 text-red-400 font-bold">
                              <Heart size={9} className="fill-red-500/20" /> PV
                            </span>
                            <span className="text-stone-300 font-medium">
                              {currentPV}/{maxPV}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-stone-950 overflow-hidden border border-red-950/60">
                            <div 
                              className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-300"
                              style={{ width: `${hpPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Barra de PM */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[10px] font-mono leading-tight">
                            <span className="flex items-center gap-1 text-blue-400 font-bold">
                              <Droplet size={9} className="fill-blue-500/20" /> PM
                            </span>
                            <span className="text-stone-300 font-medium">
                              {currentPM}/{maxPM}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-stone-950 overflow-hidden border border-blue-950/60">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-700 to-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${pmPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Badges de Condições Ativas */}
                      {conditions.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {conditions.slice(0, 3).map((cond: string) => (
                            <span 
                              key={cond}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-red-950/60 border border-red-800/50 text-red-300 font-medium truncate max-w-[120px]"
                            >
                              ⚠️ {cond}
                            </span>
                          ))}
                          {conditions.length > 3 && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-stone-800 text-stone-400">
                              +{conditions.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Rodapé Informativo */}
            <div className="p-2 border-t border-amber-900/30 text-center bg-stone-950">
              <p className="text-[10px] font-cinzel text-amber-500/70 tracking-wider">
                ✦ MESA DO MESTRE • COCKPIT ✦
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Modal / Popup de Controle do Mestre ao Clicar no Jogador */}
      {selectedPlayer && (
        <MasterPlayerControlModal
          isOpen={Boolean(selectedPlayer)}
          player={selectedPlayer}
          character={selectedCharacter}
          onClose={() => setSelectedPlayer(null)}
          onUpdateCharacter={handleUpdateCharacter}
        />
      )}
    </>
  );
};

export default PlayersPanel;
