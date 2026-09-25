import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CharacterService } from '../services/characterService';
import { UserProfileService } from '../services/userProfileService';
import { T20Character } from '../types/t20';
import { 
  Plus, 
  Search, 
  X, 
  MoreVertical, 
  Scroll, 
  Copy, 
  Trash2, 
  Shield, 
  User, 
  AlertTriangle, 
  Loader2, 
  Star, 
  ChevronDown, 
  Check, 
  ArrowUpDown, 
  Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RealmorLoading } from '../components/common/RealmorLoading';

type SortOption = 'name_asc' | 'name_desc' | 'level_desc' | 'level_asc' | 'recent';

const SORT_LABELS: Record<SortOption, string> = {
  name_asc: 'Nome: A - Z',
  name_desc: 'Nome: Z - A',
  level_desc: 'Nível: Maior',
  level_asc: 'Nível: Menor',
  recent: 'Mais Recentes'
};

// Componente de Avatar com Silhueta Estilizada Medieval (como na referência) quando não há imagem
const CharacterSilhouette: React.FC<{ name?: string }> = ({ name }) => (
  <div className="w-full h-full bg-gradient-to-b from-[#1b2620] via-[#121c17] to-[#0a110e] flex items-center justify-center relative overflow-hidden select-none">
    {/* Textura sutil de fundo */}
    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:8px_8px]" />
    
    {/* Silhueta vetorial de herói com capuz/perfil */}
    <svg viewBox="0 0 100 100" className="w-11 h-11 text-[#050807] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15 C40 15, 33 22, 33 32 C33 40, 37 46, 42 49 C28 53, 18 64, 16 80 C26 84, 38 86, 50 86 C62 86, 74 84, 84 80 C82 64, 72 53, 58 49 C63 46, 67 40, 67 32 C67 22, 60 15, 50 15 Z" />
      <path d="M46 28 C46 26, 48 24, 50 24 C52 24, 54 26, 54 28 C54 30, 52 32, 50 32 C48 32, 46 30, 46 28 Z" opacity="0.4" fill="#34d399" />
    </svg>

    {/* Borda interna sutil */}
    <div className="absolute inset-0 border border-emerald-900/30 rounded-xl pointer-events-none" />
  </div>
);

export const CharacterListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados principais
  const [characters, setCharacters] = useState<(T20Character & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Menu de ações contextual por personagem
  const [activeMenuCharId, setActiveMenuCharId] = useState<string | null>(null);

  // Modal de Exclusão
  const [charToDelete, setCharToDelete] = useState<(T20Character & { id: string }) | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  // Carrega personagens do usuário via listener em tempo real
  useEffect(() => {
    if (user?.uid) {
      setIsLoading(true);
      const unsubscribe = CharacterService.subscribeToUserCharacters(user.uid, (chars) => {
        setCharacters(chars);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Fecha dropdowns quando clica fora
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
      if (activeMenuCharId && !(event.target as Element)?.closest('.char-action-menu-container')) {
        setActiveMenuCharId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuCharId]);

  // Filtragem e ordenação dos personagens
  const filteredAndSortedCharacters = useMemo(() => {
    let list = [...characters];

    // 1. Filtro por texto de busca (nome, classe, raça)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c => 
        (c.name || '').toLowerCase().includes(q) ||
        (c.className || c.classId || '').toLowerCase().includes(q) ||
        (c.raceName || c.raceId || '').toLowerCase().includes(q)
      );
    }

    // 2. Ordenação
    list.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'level_desc':
          return (b.level || 1) - (a.level || 1);
        case 'level_asc':
          return (a.level || 1) - (b.level || 1);
        case 'recent':
        default:
          return (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0);
      }
    });

    return list;
  }, [characters, searchTerm, sortBy]);

  // Ação de duplicar personagem
  const handleDuplicate = async (char: T20Character & { id: string }) => {
    if (!user) return;
    setIsDuplicating(char.id);
    setActiveMenuCharId(null);
    try {
      await CharacterService.duplicateCharacter(user.uid, char);
    } catch (err) {
      console.error('Erro ao duplicar personagem:', err);
    } finally {
      setIsDuplicating(null);
    }
  };

  // Ação de definir como personagem principal do perfil
  const handleSetAsMainCharacter = async (char: T20Character & { id: string }) => {
    if (!user?.uid) return;
    setActiveMenuCharId(null);
    try {
      await UserProfileService.updateUserProfile(user.uid, {
        mainCharacterId: char.id,
        mainCharacterName: char.name,
        mainCharacterClass: char.className || char.classId || 'Aventureiro',
        mainCharacterRace: char.raceName || char.raceId || 'Artoniano',
        mainCharacterLevel: char.level || 1,
        mainCharacterAvatar: char.imageUrl || char.avatarUrl || ''
      });
    } catch (err) {
      console.error('Erro ao definir personagem principal:', err);
    }
  };

  // Ação de confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!charToDelete) return;
    setIsDeleting(true);
    try {
      await CharacterService.deleteCharacter(charToDelete.id);
      setCharToDelete(null);
      setActiveMenuCharId(null);
    } catch (err) {
      console.error('Erro ao excluir personagem:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Se não autenticado
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-center space-y-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#0e1118] border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(217,119,6,0.3)]">
          <User size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-cinzel text-gold-gradient font-bold uppercase tracking-widest">
            Acesso Restrito
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm max-w-xs font-sans">
            Entre na sua conta para gerenciar e visualizar seus heróis.
          </p>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-cinzel font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          Acessar RealmOR
        </button>
      </div>
    );
  }

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 animate-in fade-in duration-300">
        <RealmorLoading message="Carregando seus heróis..." subtitle="Sincronizando fichas com o grande grimório" size="md" />
      </div>
    );
  }

  // Quantidade de slots (estilo D&D Beyond: Slots: X/6 ou ilimitado)
  const totalSlotsCount = characters.length;
  const maxSlotsDisplay = Math.max(6, totalSlotsCount);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 px-2 sm:px-4 py-2 sm:py-3 pb-28 animate-in fade-in duration-300 select-none">
      
      {/* ============================================================ */}
      {/* 1. CABEÇALHO DA TELA (My Characters / Ordenação / Slots Badge) */}
      {/* ============================================================ */}
      <header className="space-y-1 pt-1 relative z-20">
        {/* Linha 1: Título à esquerda + Contador de Slots centralizado verticalmente à direita */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-base sm:text-lg font-cinzel font-black tracking-wider uppercase text-stone-100 leading-none">
            MEUS PERSONAGENS
          </h1>

          {/* Badge discreto: "X/6 SLOTS" */}
          <div className="shrink-0 flex items-center">
            <span className="px-2.5 py-0.5 rounded-full bg-[#8c1818]/90 border border-red-500/40 text-rose-100 font-sans text-[11px] sm:text-xs font-bold tracking-tight shadow-sm flex items-center leading-normal">
              {totalSlotsCount}/{maxSlotsDisplay} SLOTS
            </span>
          </div>
        </div>

        {/* Linha 2: Seletor Interativo de Ordenação alinhado à esquerda */}
        <div className="relative inline-block" ref={sortDropdownRef}>
          <button
            type="button"
            onClick={() => setIsSortDropdownOpen(prev => !prev)}
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-sans font-medium text-sky-400 hover:text-sky-300 transition-colors cursor-pointer py-0.5"
          >
            <span>{SORT_LABELS[sortBy]}</span>
            <ChevronDown size={13} className={`transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown de Ordenação */}
          {isSortDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-44 bg-[#121622] border border-stone-700/80 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95">
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setSortBy(key);
                    setIsSortDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-sans flex items-center justify-between transition-colors cursor-pointer ${
                    sortBy === key 
                      ? 'bg-amber-500/20 text-amber-300 font-bold' 
                      : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
                  }`}
                >
                  <span>{SORT_LABELS[key]}</span>
                  {sortBy === key && <Check size={12} className="text-amber-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. BARRA DE BUSCA (Search Characters)                         */}
      {/* ============================================================ */}
      <div className="relative w-full">
        <div className="relative flex items-center bg-[#151922] border border-stone-800/80 focus-within:border-sky-500/70 rounded-xl h-11 px-3.5 shadow-inner transition-colors group">
          <Search 
            size={16} 
            className="text-stone-400 group-focus-within:text-sky-400 transition-colors pointer-events-none shrink-0 mr-2.5" 
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar personagens..."
            className="w-full bg-transparent text-stone-100 placeholder-[#6b7280] text-xs sm:text-sm font-sans outline-none"
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. LISTA VERTICAL DE CARDS (Vertical Card Stack)              */}
      {/* ============================================================ */}
      <div className="space-y-2.5 sm:space-y-3">
        {filteredAndSortedCharacters.length === 0 ? (
          /* Estado Vazio */
          <div className="py-12 px-4 rounded-2xl bg-[#121620] border border-stone-800/80 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-center text-stone-500 mx-auto">
              <User size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="font-cinzel text-sm font-bold text-stone-200 uppercase">
                {searchTerm ? 'Nenhum herói encontrado' : 'Você ainda não possui personagens'}
              </h3>
              <p className="text-xs text-stone-400 font-sans max-w-xs mx-auto">
                {searchTerm 
                  ? 'Tente pesquisar com outro nome, raça ou classe.' 
                  : 'Crie seu primeiro herói para começar suas aventuras em Artón.'}
              </p>
            </div>
          </div>
        ) : (
          filteredAndSortedCharacters.map((char) => {
            const hasAvatar = Boolean(char.imageUrl || char.avatarUrl);
            const avatarSrc = char.imageUrl || char.avatarUrl;
            const levelDisplay = char.level || 1;
            const raceDisplay = char.raceName || char.raceId || char.race || 'Sem Raça Selecionada';
            const classDisplay = char.className || char.classId || 'Sem Classe Selecionada';
            const isMenuOpen = activeMenuCharId === char.id;

            return (
              <div
                key={char.id}
                className="relative rounded-xl bg-[#13161f] hover:bg-[#181d28] border border-stone-800/80 hover:border-stone-700/80 transition-all duration-200 p-2.5 sm:p-3 flex items-center justify-between gap-3 group shadow-md"
              >
                {/* Lado Esquerdo + Centro (Clique abre a ficha completa) */}
                <div 
                  onClick={() => navigate(`/characters/${char.id}`)}
                  className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1 cursor-pointer select-none"
                >
                  {/* Avatar Quadrado com Cantos Arredondados (Imagem ou Silhueta) */}
                  <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl overflow-hidden bg-[#181d29] border border-stone-700/60 shrink-0 flex items-center justify-center relative shadow-sm">
                    {hasAvatar ? (
                      <img 
                        src={avatarSrc} 
                        alt={char.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <CharacterSilhouette name={char.name} />
                    )}
                  </div>

                  {/* Informações do Personagem */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    {/* Nome do Personagem em Destaque */}
                    <h2 className="font-bold text-sm sm:text-base text-stone-100 group-hover:text-amber-200 transition-colors truncate leading-snug">
                      {char.name || 'Personagem Sem Nome'}
                    </h2>

                    {/* Linha 1: Nível | Raça */}
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 font-sans truncate">
                      <span className="text-stone-300 font-medium">
                        Nível {levelDisplay}
                      </span>
                      <span className="text-stone-600 font-bold">|</span>
                      <span className="truncate">
                        {raceDisplay}
                      </span>
                    </div>

                    {/* Linha 2: Classe */}
                    <p className="text-xs text-stone-400 font-sans truncate leading-none">
                      {classDisplay}
                    </p>
                  </div>
                </div>

                {/* Lado Direito: Menu de 3 Pontos Verticais (⋮) */}
                <div className="relative shrink-0 char-action-menu-container">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCharId(prev => prev === char.id ? null : char.id);
                    }}
                    className="p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-white/5 transition-colors cursor-pointer"
                    title="Mais opções"
                    aria-label="Mais opções do personagem"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {/* Dropdown de Ações */}
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-9 w-48 bg-[#121622] border border-stone-700/80 rounded-xl shadow-2xl z-40 p-1 space-y-0.5"
                      >
                        {/* 1. Abrir Ficha */}
                        <button
                          onClick={() => {
                            setActiveMenuCharId(null);
                            navigate(`/characters/${char.id}`);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-sans text-stone-200 hover:bg-stone-800/80 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Scroll size={14} className="text-amber-400" />
                          <span>Abrir Ficha</span>
                        </button>

                        {/* 2. Definir como Principal */}
                        <button
                          onClick={() => handleSetAsMainCharacter(char)}
                          className="w-full text-left px-3 py-2 text-xs font-sans text-stone-200 hover:bg-stone-800/80 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Star size={14} className="text-amber-400" />
                          <span>Definir como Principal</span>
                        </button>

                        {/* 3. Duplicar Ficha */}
                        <button
                          onClick={() => handleDuplicate(char)}
                          disabled={isDuplicating === char.id}
                          className="w-full text-left px-3 py-2 text-xs font-sans text-stone-200 hover:bg-stone-800/80 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isDuplicating === char.id ? (
                            <Loader2 size={14} className="animate-spin text-amber-400" />
                          ) : (
                            <Copy size={14} className="text-stone-400" />
                          )}
                          <span>Duplicar Ficha</span>
                        </button>

                        {/* 4. Excluir Personagem */}
                        <button
                          onClick={() => {
                            setActiveMenuCharId(null);
                            setCharToDelete(char);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-sans text-rose-300 hover:bg-rose-950/40 rounded-lg flex items-center gap-2.5 transition-colors border-t border-stone-800/80 mt-1 cursor-pointer"
                        >
                          <Trash2 size={14} className="text-rose-400" />
                          <span>Excluir Personagem</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. BOTÃO FLUTUANTE INFERIOR [ CREATE NEW CHARACTER ]          */}
      {/* ============================================================ */}
      <div className="fixed bottom-18 left-0 right-0 z-30 flex items-center justify-center px-4 pointer-events-none">
        <button
          onClick={() => navigate('/characters/sheet')}
          className="pointer-events-auto py-2.5 px-6 sm:px-8 rounded-lg bg-[#0e1624]/95 hover:bg-[#142034] border border-sky-400/80 hover:border-sky-300 text-sky-400 hover:text-sky-200 font-sans font-bold text-xs sm:text-sm tracking-wider uppercase shadow-[0_8px_25px_rgba(0,0,0,0.85)] hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
        >
          <span>CRIAR NOVO PERSONAGEM</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 5. MODAL DE EXCLUSÃO DE PERSONAGEM                            */}
      {/* ============================================================ */}
      {charToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isDeleting && setCharToDelete(null)}
        >
          <div 
            className="bg-[#121622] border border-rose-900/60 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-[0_15px_40px_rgba(0,0,0,0.95)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="font-cinzel text-sm font-bold text-rose-300 uppercase">
                  Excluir Personagem
                </h4>
                <p className="text-[11px] text-stone-400">
                  Esta ação é irreversível
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Tem certeza que deseja apagar a ficha de <strong className="text-amber-200 font-cinzel">{charToDelete.name}</strong>? Todos os dados serão perdidos.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setCharToDelete(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-cinzel font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-xs font-cinzel font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <span>Confirmar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterListPage;
