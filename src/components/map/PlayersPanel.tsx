import React, { useState } from 'react';
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
  Circle
} from 'lucide-react';
import { TestPlayer } from './types';

// Jogadores fictícios para teste inicial
const INITIAL_TEST_PLAYERS: TestPlayer[] = [
  {
    id: 'p-1',
    name: 'Arkon',
    characterClass: 'Guerreiro Humano',
    status: 'online',
    hp: { current: 38, max: 38 },
    pm: { current: 12, max: 12 }
  },
  {
    id: 'p-2',
    name: 'Lyra',
    characterClass: 'Maga Elfa',
    status: 'online',
    hp: { current: 22, max: 22 },
    pm: { current: 45, max: 45 }
  },
  {
    id: 'p-3',
    name: 'Tharok',
    characterClass: 'Patrulheiro Anão',
    status: 'away',
    hp: { current: 31, max: 35 },
    pm: { current: 18, max: 20 }
  },
  {
    id: 'p-4',
    name: 'Elenya',
    characterClass: 'Clériga de Lena',
    status: 'online',
    hp: { current: 28, max: 28 },
    pm: { current: 30, max: 30 }
  }
];

export const PlayersPanel: React.FC = () => {
  const [players] = useState<TestPlayer[]>(INITIAL_TEST_PLAYERS);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getClassIcon = (cls: string) => {
    if (cls.includes('Guerreiro')) return Sword;
    if (cls.includes('Maga')) return Wand2;
    if (cls.includes('Patrulheiro')) return Target;
    return Sparkles;
  };

  return (
    <aside 
      id="map-right-players-panel"
      className={`h-full bg-stone-950/95 border-l border-amber-900/40 flex flex-col shrink-0 select-none z-20 shadow-[-4px_0_15px_rgba(0,0,0,0.5)] transition-all duration-200 relative ${
        isCollapsed ? 'w-11' : 'w-60 sm:w-64'
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

      {/* Conteúdo quando Recolhido */}
      {isCollapsed ? (
        <div className="flex flex-col items-center py-4 space-y-6">
          <div className="text-amber-400" title="Jogadores">
            <Users size={18} />
          </div>
          <div className="flex flex-col items-center gap-3">
            {players.map(p => (
              <div 
                key={p.id}
                className="w-7 h-7 rounded-full bg-stone-900 border border-amber-900/50 flex items-center justify-center text-xs font-bold text-amber-300 relative group cursor-pointer"
                title={`${p.name} (${p.characterClass})`}
              >
                {p.name[0]}
                <span 
                  className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-stone-950 ${
                    p.status === 'online' ? 'bg-emerald-400' : p.status === 'away' ? 'bg-amber-400' : 'bg-stone-500'
                  }`} 
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Conteúdo Normal Expandido */
        <div className="flex flex-col h-full overflow-hidden">
          {/* Cabeçalho do Painel */}
          <div className="p-3.5 border-b border-amber-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-amber-400" />
              <h3 className="font-cinzel font-bold text-xs uppercase tracking-widest text-amber-200">
                JOGADORES
              </h3>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-400 font-bold">
              {players.filter(p => p.status === 'online').length}/{players.length} ON
            </span>
          </div>

          {/* Lista de Aventureiros */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
            {players.map((p) => {
              const Icon = getClassIcon(p.characterClass);
              const hpPercent = Math.round((p.hp.current / p.hp.max) * 100);
              const pmPercent = Math.round((p.pm.current / p.pm.max) * 100);

              return (
                <div
                  key={p.id}
                  className="p-2.5 rounded-lg bg-stone-900/80 border border-amber-900/30 hover:border-amber-700/60 transition-all space-y-2 shadow-sm group"
                >
                  {/* Topo do Card: Nome e Classe */}
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded bg-stone-950 border border-amber-900/50 flex items-center justify-center text-amber-400 shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-cinzel font-bold text-xs text-amber-100 truncate group-hover:text-amber-300 transition-colors">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-stone-400 truncate">
                          {p.characterClass}
                        </p>
                      </div>
                    </div>

                    {/* Status Dot */}
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <span 
                        className={`w-2 h-2 rounded-full ${
                          p.status === 'online'
                            ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                            : p.status === 'away'
                            ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                            : 'bg-stone-600'
                        }`} 
                      />
                      <span className="text-[9px] font-cinzel text-stone-400 uppercase">
                        {p.status === 'online' ? 'Online' : p.status === 'away' ? 'Ausente' : 'Off'}
                      </span>
                    </div>
                  </div>

                  {/* Barras de Recursos (PV e PM) */}
                  <div className="space-y-1.5 pt-1 border-t border-stone-800/60">
                    {/* Barra de PV */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px] font-mono leading-tight">
                        <span className="flex items-center gap-1 text-red-400 font-bold">
                          <Heart size={9} /> PV
                        </span>
                        <span className="text-stone-300 font-medium">
                          {p.hp.current}/{p.hp.max}
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
                          <Droplet size={9} /> PM
                        </span>
                        <span className="text-stone-300 font-medium">
                          {p.pm.current}/{p.pm.max}
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
                </div>
              );
            })}
          </div>

          {/* Rodapé Informativo */}
          <div className="p-2 border-t border-amber-900/30 text-center bg-stone-950">
            <p className="text-[10px] font-cinzel text-amber-500/60 tracking-wider">
              ✦ MESA TÁTICA ISOLADA ✦
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
