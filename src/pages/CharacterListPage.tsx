import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CharacterService } from '../services/characterService';
import { T20Character } from '../types/t20';
import { CharacterListItem } from '../components/character/CharacterListItem';
import { 
  Plus, 
  Search, 
  X, 
  User, 
  Loader2, 
  Sword, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/Button';
import { RealmorLoading } from '../components/common/RealmorLoading';

type SortOption = 'name-asc' | 'name-desc' | 'level-desc' | 'level-asc' | 'recent';

export const CharacterListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [characters, setCharacters] = useState<(T20Character & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Estado para modal de exclusão
  const [charToDelete, setCharToDelete] = useState<(T20Character & { id: string }) | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Ação de duplicar personagem
  const handleDuplicate = async (char: T20Character & { id: string }) => {
    if (!user) return;
    try {
      await CharacterService.duplicateCharacter(user.uid, char);
    } catch (err) {
      console.error('Erro ao duplicar personagem:', err);
    }
  };

  // Ação de confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!charToDelete) return;
    setIsDeleting(true);
    try {
      await CharacterService.deleteCharacter(charToDelete.id);
      setCharToDelete(null);
    } catch (err) {
      console.error('Erro ao excluir personagem:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtragem e ordenação dos personagens
  const filteredAndSortedCharacters = useMemo(() => {
    let result = [...characters];

    // Busca textual
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((char) => {
        const name = (char.name || char.characterData?.identity?.name || '').toLowerCase();
        const race = ((char as any).raceName || (char as any).race || char.characterData?.identity?.raceName || '').toLowerCase();
        const className = ((char as any).className || (char as any).class || '').toLowerCase();
        return name.includes(term) || race.includes(term) || className.includes(term);
      });
    }

    // Ordenação
    result.sort((a, b) => {
      const nameA = (a.name || a.characterData?.identity?.name || '').toLowerCase();
      const nameB = (b.name || b.characterData?.identity?.name || '').toLowerCase();
      const levelA = a.level || a.characterData?.identity?.level || 1;
      const levelB = b.level || b.characterData?.identity?.level || 1;

      switch (sortOption) {
        case 'name-asc':
          return nameA.localeCompare(nameB);
        case 'name-desc':
          return nameB.localeCompare(nameA);
        case 'level-desc':
          return levelB - levelA;
        case 'level-asc':
          return levelA - levelB;
        case 'recent':
        default:
          return 0;
      }
    });

    return result;
  }, [characters, searchTerm, sortOption]);

  const sortLabelMap: Record<SortOption, string> = {
    'name-asc': 'Nome: A - Z',
    'name-desc': 'Nome: Z - A',
    'level-desc': 'Nível: Maior',
    'level-asc': 'Nível: Menor',
    'recent': 'Mais Recentes',
  };

  // Se não autenticado
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 px-4 animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-xl bg-black/60 border border-gold/30 flex items-center justify-center text-gold/60 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
          <User size={32} />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-cinzel text-gold-gradient font-bold uppercase tracking-wider">Acesso Restrito</h2>
          <p className="text-gold/50 text-xs italic max-w-xs font-sans">
            "Apenas personagens registrados no grande grimório podem ver suas crônicas."
          </p>
        </div>
        <Button onClick={() => navigate('/auth')} icon={Plus} size="sm">
          Acessar Codex / Entrar
        </Button>
      </div>
    );
  }

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 animate-in fade-in duration-300">
        <RealmorLoading message="Consultando os registros de Arton..." subtitle="Recuperando fichas de personagens" size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full px-3 sm:px-4 space-y-3 animate-in fade-in duration-300 pb-36">
      {/* ============================================================ */}
      {/* CABEÇALHO CENTRALIZADO: MEUS PERSONAGENS & ORDENAÇÃO         */}
      {/* ============================================================ */}
      <div className="text-center pt-2 pb-1 space-y-1">
        {/* Título Principal Centralizado */}
        <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-gold tracking-widest uppercase leading-tight drop-shadow-sm">
          Meus Personagens
        </h1>

        {/* Ordenação Compacta Centralizada Logo Abaixo do Título */}
        <div className="relative inline-block">
          <button
            id="sort-characters-button"
            onClick={() => setShowSortMenu(prev => !prev)}
            className="flex items-center justify-center gap-1 text-[11px] sm:text-xs font-sans text-amber-400/90 hover:text-amber-200 transition-colors focus:outline-none cursor-pointer py-0.5 px-2 rounded hover:bg-white/5"
          >
            <span className="font-semibold">{sortLabelMap[sortOption]}</span>
            <ChevronDown size={13} className={`transition-transform duration-200 ${showSortMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu Dropdown de Ordenação */}
          {showSortMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowSortMenu(false)} 
              />
              <div className="absolute left-1/2 -translate-x-1/2 top-7 w-38 bg-[#0e0e14] border border-amber-900/40 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.95)] z-50 py-1 animate-in fade-in zoom-in-95 duration-150">
                {(Object.keys(sortLabelMap) as SortOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortOption(opt);
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-center px-3 py-1.5 text-xs font-sans transition-colors cursor-pointer ${
                      sortOption === opt 
                        ? 'text-amber-300 font-bold bg-amber-500/15' 
                        : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                    }`}
                  >
                    {sortLabelMap[opt]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CAMPO DE BUSCA COMPACTO (Search Characters)                  */}
      {/* ============================================================ */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
          <Search size={15} />
        </div>
        <input
          id="character-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar personagens..."
          className="w-full pl-9 pr-8 py-2 bg-[#101016]/90 border border-amber-900/30 focus:border-amber-500/60 rounded-xl text-xs sm:text-sm text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all shadow-inner"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-200 cursor-pointer"
            aria-label="Limpar busca"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* LISTA COMPACTA DE PERSONAGENS                                */}
      {/* ============================================================ */}
      {characters.length === 0 ? (
        /* Estado Vazio */
        <div className="bg-[#121217]/80 border border-dashed border-amber-900/40 rounded-xl p-8 text-center space-y-4 my-4">
          <div className="w-13 h-13 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400/50">
            <Sword size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-cinzel font-bold text-amber-200/90 uppercase">
              Nenhum personagem criado
            </h3>
            <p className="text-xs text-stone-400 italic font-sans">
              "Toda grande lenda começa com a criação do seu primeiro personagem."
            </p>
          </div>
        </div>
      ) : filteredAndSortedCharacters.length === 0 ? (
        /* Busca Sem Resultados */
        <div className="text-center py-8 space-y-2 bg-[#101015]/80 rounded-xl border border-stone-800">
          <p className="text-xs text-stone-400 font-sans">
            Nenhum personagem encontrado para "<span className="text-amber-300">{searchTerm}</span>".
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-[11px] text-amber-400 hover:text-amber-300 underline font-cinzel uppercase cursor-pointer"
          >
            Limpar Filtro
          </button>
        </div>
      ) : (
        /* Lista dos Cards Compactos */
        <div className="space-y-2">
          {filteredAndSortedCharacters.map((char) => (
            <CharacterListItem
              key={char.id}
              character={char}
              onDuplicate={handleDuplicate}
              onDeleteRequest={(c) => setCharToDelete(c)}
            />
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* BOTÃO FLUTUANTE: + NOVO PERSONAGEM                           */}
      {/* Fica próximo à parte inferior, acima da barra de navegação   */}
      {/* ============================================================ */}
      <div className="fixed bottom-19 sm:bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button
          id="create-new-character-floating-btn"
          onClick={() => navigate('/characters/sheet')}
          className="py-2 px-5 rounded-lg bg-[#0e1726]/95 hover:bg-[#14233a] border border-sky-500/60 hover:border-sky-400 text-sky-300 hover:text-sky-100 font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(0,0,0,0.85),0_0_15px_rgba(14,165,233,0.3)] backdrop-blur-md active:scale-95 cursor-pointer group"
        >
          <Plus size={16} className="text-sky-400 group-hover:scale-110 transition-transform" />
          <span>Novo Personagem</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO                             */}
      {/* ============================================================ */}
      {charToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isDeleting && setCharToDelete(null)}
        >
          <div 
            className="bg-[#101015] border border-red-900/50 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-[0_15px_40px_rgba(0,0,0,0.95)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="font-cinzel text-sm font-bold text-red-300 uppercase">
                  Excluir Personagem
                </h4>
                <p className="text-[11px] text-stone-400">
                  Esta ação é irreversível
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Tem certeza que deseja apagar a crônica de <span className="font-bold text-amber-200 font-cinzel">{charToDelete.name || 'este personagem'}</span>? O personagem será removido permanentemente do seu grimório.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setCharToDelete(null)}
                className="flex-1 py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-cinzel font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-3 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 text-xs font-cinzel font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
