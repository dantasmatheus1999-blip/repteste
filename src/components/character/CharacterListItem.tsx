import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MoreVertical, 
  Eye, 
  Copy, 
  Trash2, 
  Shield, 
  Heart, 
  Sparkles,
  User as UserIcon,
  Sword
} from 'lucide-react';
import { T20Character } from '../../types/t20';
import { T20_CLASSES } from '../../data/t20Data';
import { T20_RACES } from '../../data/t20Races';
import { buildFichaCompleta } from '../../services/characterEngine';

interface CharacterListItemProps {
  character: T20Character & { id: string };
  onDuplicate: (char: T20Character & { id: string }) => void;
  onDeleteRequest: (char: T20Character & { id: string }) => void;
}

export const CharacterListItem: React.FC<CharacterListItemProps> = ({
  character,
  onDuplicate,
  onDeleteRequest
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Extração inteligente e segura dos dados reais do personagem
  const rawAny = character as any;
  const name = character.name || character.characterData?.identity?.name || 'Herói sem Nome';
  const level = character.level || character.characterData?.identity?.level || 1;

  // Raça
  let raceName = rawAny.raceName || rawAny.race || character.characterData?.identity?.raceName;
  if (!raceName) {
    const raceId = rawAny.raceId || character.characterData?.identity?.raceId;
    const foundRace = T20_RACES.find(r => r.id === raceId);
    raceName = foundRace ? foundRace.name : '';
  }

  // Classe
  let className = rawAny.className || rawAny.class;
  if (!className) {
    const classId = character.classId || character.characterData?.identity?.classId;
    const foundClass = T20_CLASSES[classId as keyof typeof T20_CLASSES];
    className = foundClass ? foundClass.name : 'Aventureiro';
  }

  // Imagem / Avatar
  const avatarUrl = rawAny.imageUrl || character.characterData?.identity?.imageUrl || rawAny.avatar || rawAny.photoURL || '';

  // Pontos de Vida (PV) e Pontos de Mana (PM)
  let currentPV = typeof character.currentPV === 'number' ? character.currentPV : (character.characterData?.state?.currentPV ?? 20);
  let maxPV = rawAny.pvMax || character.characterData?.combat?.hpMax || character.characterData?.state?.pvMax || currentPV || 20;

  let currentPM = typeof character.currentPM === 'number' ? character.currentPM : (character.characterData?.state?.currentPM ?? 0);
  let maxPM = rawAny.pmMax || character.characterData?.combat?.manaMax || character.characterData?.state?.pmMax || currentPM || 0;

  let defense = rawAny.defense ?? character.characterData?.combat?.defense;

  // Se possuir ficha estruturada, tenta resolver via engine para máxima fidelidade
  if (character.characterData) {
    try {
      const ficha = buildFichaCompleta(character.characterData);
      if (ficha?.resources?.pvMax?.total) {
        maxPV = ficha.resources.pvMax.total;
        currentPV = ficha.resources.pvCurrent ?? currentPV;
      }
      if (ficha?.resources?.pmMax?.total) {
        maxPM = ficha.resources.pmMax.total;
        currentPM = ficha.resources.pmCurrent ?? currentPM;
      }
      if (ficha?.combat?.defense?.total) {
        defense = ficha.combat.defense.total;
      }
    } catch {
      // Usa os dados diretos extraídos acima
    }
  }

  // Cálculo da porcentagem de vida e cor do status
  const pvPercent = maxPV > 0 ? Math.min(100, Math.max(0, (currentPV / maxPV) * 100)) : 100;
  const isWounded = currentPV < maxPV;
  const isCritical = pvPercent <= 25;
  const isWarning = pvPercent > 25 && pvPercent <= 50;

  let pvTextColor = 'text-emerald-400';
  let pvBarColor = 'bg-emerald-500';
  if (isCritical) {
    pvTextColor = 'text-red-400';
    pvBarColor = 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]';
  } else if (isWarning) {
    pvTextColor = 'text-amber-400';
    pvBarColor = 'bg-amber-500';
  }

  const pmPercent = maxPM > 0 ? Math.min(100, Math.max(0, (currentPM / maxPM) * 100)) : 100;
  const hasPM = maxPM > 0 || currentPM > 0;

  const handleCardClick = () => {
    navigate(`/characters/${character.id}`);
  };

  return (
    <div 
      className="group relative bg-[#121217] hover:bg-[#181820] border border-gold/15 hover:border-gold/40 rounded-xl p-2.5 sm:p-3 transition-all duration-200 shadow-[0_3px_12px_rgba(0,0,0,0.6)] flex items-center gap-3 cursor-pointer select-none"
      onClick={handleCardClick}
      id={`character-card-${character.id}`}
    >
      {/* Moldura de iluminação sutil no hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* ============================================================ */}
      {/* FOTO / AVATAR COMPACTO (Lado Esquerdo)                         */}
      {/* ============================================================ */}
      <div className="relative shrink-0 w-13 h-15 sm:w-14 sm:h-16 rounded-lg overflow-hidden border border-gold/30 bg-black/80 shadow-[0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback se a imagem falhar ao carregar
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-stone-900 to-black text-gold/70">
            <UserIcon size={22} className="text-gold/50 mb-0.5" />
            <span className="font-cinzel font-bold text-[9px] text-gold/60 uppercase">
              {name.charAt(0) || 'H'}
            </span>
          </div>
        )}
        {/* Borda interna decorativa */}
        <div className="absolute inset-0 rounded-lg border border-gold/10 pointer-events-none" />
      </div>

      {/* ============================================================ */}
      {/* CORPO DO CARD COM AS INFORMAÇÕES CENTRAIS                    */}
      {/* ============================================================ */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Linha 1: Nome do Personagem */}
        <div className="flex items-center gap-2">
          <h3 className="font-cinzel font-bold text-sm sm:text-base text-stone-100 group-hover:text-amber-200 transition-colors truncate tracking-wide">
            {name}
          </h3>
        </div>

        {/* Linha 2: Nível | Raça */}
        <div className="flex items-center text-[11px] sm:text-xs text-stone-300 font-sans tracking-wide mt-0.5">
          <span className="font-medium text-stone-300">
            Nível {level}
          </span>
          {raceName && (
            <>
              <span className="text-red-500/80 mx-1.5 font-bold text-[10px]">|</span>
              <span className="text-stone-300 truncate">
                {raceName}
              </span>
            </>
          )}
        </div>

        {/* Linha 3: Classe */}
        <div className="text-[11px] sm:text-xs text-stone-400 font-sans leading-tight mt-0.5 truncate">
          {className}
        </div>

        {/* Linha 4: Estatísticas de Recursos (PV, PM, Defesa) */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 pt-1 border-t border-white/5">
          {/* PV com indicador numérico e mini barra */}
          <div className="flex items-center gap-1.5" title={`Pontos de Vida: ${currentPV} de ${maxPV}`}>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-cinzel font-black uppercase tracking-wider text-stone-400">PV</span>
              <span className={`text-[11px] font-mono font-bold leading-none ${pvTextColor}`}>
                {currentPV}<span className="text-stone-500 font-normal text-[10px]">/{maxPV}</span>
              </span>
            </div>
            {/* Barra de progresso de vida compacta */}
            <div className="w-12 sm:w-16 h-1.5 bg-black/60 rounded-full overflow-hidden border border-stone-800/80">
              <div 
                className={`h-full ${pvBarColor} rounded-full transition-all duration-300`}
                style={{ width: `${pvPercent}%` }}
              />
            </div>
          </div>

          {/* PM com indicador numérico e mini barra (se aplicável) */}
          {hasPM && (
            <div className="flex items-center gap-1.5" title={`Pontos de Mana: ${currentPM} de ${maxPM}`}>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-cinzel font-black uppercase tracking-wider text-stone-400">PM</span>
                <span className="text-[11px] font-mono font-bold text-sky-400 leading-none">
                  {currentPM}<span className="text-stone-500 font-normal text-[10px]">/{maxPM}</span>
                </span>
              </div>
              <div className="w-10 sm:w-12 h-1.5 bg-black/60 rounded-full overflow-hidden border border-stone-800/80">
                <div 
                  className="h-full bg-sky-500 rounded-full transition-all duration-300 shadow-[0_0_4px_rgba(14,165,233,0.5)]"
                  style={{ width: `${pmPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Defesa / CA se disponível */}
          {typeof defense === 'number' && defense > 0 && (
            <div className="hidden xs:flex items-center gap-1 text-[10px] text-stone-400 font-mono" title={`Defesa: ${defense}`}>
              <Shield size={10} className="text-gold/70" />
              <span className="font-bold text-stone-300">{defense}</span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTÃO DE TRÊS PONTOS (⋮) E DROPDOWN DE AÇÕES                */}
      {/* ============================================================ */}
      <div className="relative shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
        <button
          id={`character-actions-btn-${character.id}`}
          onClick={() => setMenuOpen(prev => !prev)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-gold hover:bg-gold/10 transition-colors focus:outline-none"
          aria-label="Ações do personagem"
          title="Opções do personagem"
        >
          <MoreVertical size={18} />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 top-9 w-44 bg-[#0e0e13] border border-gold/30 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.9)] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate(`/characters/${character.id}`);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-cinzel font-semibold text-stone-200 hover:text-amber-200 hover:bg-gold/10 transition-colors text-left"
            >
              <Eye size={14} className="text-gold" />
              <span>Ver Ficha</span>
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onDuplicate(character);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-cinzel font-semibold text-stone-200 hover:text-amber-200 hover:bg-gold/10 transition-colors text-left"
            >
              <Copy size={14} className="text-stone-400" />
              <span>Duplicar</span>
            </button>

            <div className="my-1 border-t border-white/10" />

            <button
              onClick={() => {
                setMenuOpen(false);
                onDeleteRequest(character);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-cinzel font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-left"
            >
              <Trash2 size={14} className="text-red-400" />
              <span>Excluir</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
