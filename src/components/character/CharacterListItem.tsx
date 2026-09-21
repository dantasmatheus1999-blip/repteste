import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MoreVertical, 
  Eye, 
  Copy, 
  Trash2, 
  User as UserIcon
} from 'lucide-react';
import { T20Character } from '../../types/t20';
import { T20_CLASSES } from '../../data/t20Data';
import { T20_RACES } from '../../data/t20Races';

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

  // Extração segura dos dados reais do personagem
  const rawAny = character as any;
  const name = character.name || character.characterData?.identity?.name || 'Personagem Sem Nome';
  const level = character.level || character.characterData?.identity?.level || 1;

  // Raça
  let raceName = rawAny.raceName || rawAny.race || character.characterData?.identity?.raceName;
  if (!raceName) {
    const raceId = rawAny.raceId || character.characterData?.identity?.raceId;
    const foundRace = T20_RACES.find(r => r.id === raceId);
    raceName = foundRace ? foundRace.name : 'Sem Raça';
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

  const handleCardClick = () => {
    navigate(`/characters/${character.id}`);
  };

  return (
    <div 
      className="group relative bg-[#121217]/90 hover:bg-[#181822] border border-amber-900/25 hover:border-amber-500/40 rounded-xl p-2.5 transition-all duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.5)] flex items-center gap-3 cursor-pointer select-none"
      onClick={handleCardClick}
      id={`character-card-${character.id}`}
    >
      {/* Moldura de iluminação sutil no hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* ============================================================ */}
      {/* AVATAR COMPACTO (Lado Esquerdo - Proporção elegante 48x48px)   */}
      {/* ============================================================ */}
      <div className="relative shrink-0 w-12 h-12 sm:w-13 sm:h-13 rounded-lg overflow-hidden border border-amber-700/30 bg-black/80 shadow-inner flex items-center justify-center">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-stone-900 to-black text-amber-300/60">
            <UserIcon size={20} className="text-amber-400/50" />
          </div>
        )}
        {/* Borda interna sutil */}
        <div className="absolute inset-0 rounded-lg border border-white/5 pointer-events-none" />
      </div>

      {/* ============================================================ */}
      {/* INFORMAÇÕES CENTRAIS (Nome, Nível | Raça, Classe)            */}
      {/* ============================================================ */}
      <div className="flex-1 min-w-0">
        {/* Nome do Personagem */}
        <h3 className="font-cinzel font-bold text-sm sm:text-base text-stone-100 group-hover:text-amber-200 transition-colors truncate tracking-wide leading-tight">
          {name}
        </h3>

        {/* Nível | Raça */}
        <div className="flex items-center text-[11px] sm:text-xs text-stone-300 font-sans tracking-wide mt-0.5">
          <span className="font-medium text-stone-300">
            Nível {level}
          </span>
          {raceName && (
            <>
              <span className="text-red-500/70 mx-1.5 font-bold text-[10px]">|</span>
              <span className="text-stone-300 truncate">
                {raceName}
              </span>
            </>
          )}
        </div>

        {/* Classe */}
        <div className="text-[11px] sm:text-xs text-stone-400 font-sans leading-tight mt-0.5 truncate">
          {className}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MENU DE TRÊS PONTOS (⋮) DISCRETO                             */}
      {/* ============================================================ */}
      <div className="relative shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
        <button
          id={`character-actions-btn-${character.id}`}
          onClick={() => setMenuOpen(prev => !prev)}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-amber-300 hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
          aria-label="Ações do personagem"
          title="Opções do personagem"
        >
          <MoreVertical size={16} />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 top-8 w-40 bg-[#0e0e13] border border-amber-900/40 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.95)] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate(`/characters/${character.id}`);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-cinzel font-semibold text-stone-200 hover:text-amber-200 hover:bg-gold/10 transition-colors text-left cursor-pointer"
            >
              <Eye size={13} className="text-amber-400" />
              <span>Ver Ficha</span>
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onDuplicate(character);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-cinzel font-semibold text-stone-200 hover:text-amber-200 hover:bg-gold/10 transition-colors text-left cursor-pointer"
            >
              <Copy size={13} className="text-stone-400" />
              <span>Duplicar</span>
            </button>

            <div className="my-1 border-t border-white/10" />

            <button
              onClick={() => {
                setMenuOpen(false);
                onDeleteRequest(character);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-cinzel font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-left cursor-pointer"
            >
              <Trash2 size={13} className="text-red-400" />
              <span>Excluir</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
