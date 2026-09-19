import React, { useState, useEffect } from 'react';
import { BookOpen, Search, RefreshCw, X, Skull, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchStorageMonsterLibrary, getStorageLibraryStatus, StorageMonster, StorageLibraryStatus } from '../../../services/monsterStorageService';
import { auth, onAuthStateChanged } from '../../../firebase/auth';

interface MonsterStorageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (monster: StorageMonster) => void;
  title?: string;
  combatRole?: 'solo' | 'lacaio' | 'especial' | string;
  scale?: string;
}

export const MonsterStorageLibraryModal: React.FC<MonsterStorageLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Biblioteca de Monstros',
  combatRole = 'solo',
  scale = 'normal'
}) => {
  const [monsters, setMonsters] = useState<StorageMonster[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [libraryStatus, setLibraryStatus] = useState<StorageLibraryStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const normalizedRole = (combatRole || 'solo').toUpperCase();
  const roleDisplay = normalizedRole === 'LACAIO' ? 'LACAIO' : normalizedRole === 'ESPECIAL' ? 'ESPECIAL' : 'SOLO';
  const scaleDisplay = (scale || 'normal').toUpperCase();
  const badgeLabel = `MOSTRO • ${scaleDisplay} • ${roleDisplay}`;

  const loadMonsters = async (force = false) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const items = await fetchStorageMonsterLibrary(force);
      setMonsters(items);
      setLibraryStatus(getStorageLibraryStatus().status);
    } catch (err: any) {
      console.error('[MonsterStorageLibraryModal] Erro ao carregar acervo do Firebase Storage:', err);
      setLibraryStatus('permission_denied');
      setErrorMessage(err?.message || 'Erro de permissão no Firebase Storage para a pasta monstro/.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMonsters();
    }
  }, [isOpen]);

  // Se o usuário autenticar após a abertura, recarrega caso esteja vazio
  useEffect(() => {
    if (!isOpen) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && monsters.length === 0) {
        loadMonsters(true);
      }
    });
    return unsub;
  }, [isOpen, monsters.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredMonsters = monsters.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.15 }}
            className="bg-mythos-bg border-2 border-gold/40 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.85)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gold/20 flex items-center justify-between bg-black/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-cinzel font-black text-gold uppercase tracking-wider">
                    {title}
                  </h3>
                  <p className="text-[11px] text-gold/60 font-cinzel">
                    Acervo do Firebase Storage (pasta <code className="text-amber-300 font-mono">monstro/</code>)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadMonsters(true)}
                  disabled={loading}
                  className="p-2 text-gold/60 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors title='Atualizar'"
                  title="Atualizar lista"
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gold/60 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors cursor-pointer"
                  title="Fechar (ESC)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-3 sm:p-4 border-b border-gold/10 bg-black/30 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/40" size={16} />
                <input
                  type="text"
                  placeholder="Filtrar criaturas pelo nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/60 border border-gold/20 rounded-xl pl-10 pr-4 py-2 text-sm text-gold focus:outline-none focus:border-gold font-cinzel placeholder:text-gold/30"
                  autoFocus
                />
              </div>
              <span className="text-xs text-gold/40 font-mono shrink-0 hidden sm:inline">
                {filteredMonsters.length} {filteredMonsters.length === 1 ? 'criatura' : 'criaturas'}
              </span>
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-gold animate-spin" />
                  <p className="text-gold/60 font-cinzel italic text-sm animate-pulse">
                    Carregando criaturas da pasta monstro/...
                  </p>
                </div>
              ) : errorMessage ? (
                <div className="py-12 px-4 max-w-lg mx-auto text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-cinzel font-bold text-amber-300">
                      Erro no Firebase Storage
                    </h4>
                    <p className="text-[11px] font-mono text-amber-200/90 mt-1.5 p-2.5 rounded bg-amber-950/40 border border-amber-500/20 break-words text-left">
                      <strong>Detalhes:</strong> {errorMessage}
                    </p>
                    <p className="text-xs text-gold/70 mt-2 font-cinzel leading-relaxed">
                      Não foi possível listar os monstros na pasta <code className="text-amber-300 font-mono">monstro/</code>. Verifique se o usuário está autenticado e com permissão no Firebase.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadMonsters(true)}
                    className="px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/40 text-gold text-xs font-cinzel rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Tentar Novamente
                  </button>
                </div>
              ) : filteredMonsters.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Skull className="w-12 h-12 text-gold/20 mx-auto" />
                  <p className="text-gold/60 font-cinzel font-bold">Nenhum monstro encontrado</p>
                  <p className="text-xs text-gold/40 font-cinzel max-w-md mx-auto">
                    Nenhum arquivo .png corresponde aos termos digitados ou a pasta monstro/ está vazia.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredMonsters.map((monster) => (
                    <div
                      key={monster.id}
                      onClick={() => onSelect(monster)}
                      className="group relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-gold/20 hover:border-gold cursor-pointer transition-all hover:scale-[1.02] shadow-lg bg-black/40 flex flex-col justify-end"
                      title={`Selecionar ${monster.name}`}
                    >
                      <img
                        src={monster.url}
                        alt={monster.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const proxyUrl = `/api/storage/proxy-image?path=${encodeURIComponent(monster.fullPath || monster.fileName)}`;
                          if (!target.src.includes('/api/storage/proxy-image')) {
                            target.src = proxyUrl;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                      
                      {/* Name in library card footer */}
                      <div className="relative z-10 p-3">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-black/80 border border-gold/30 text-[9px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1 shadow-sm">
                          {badgeLabel}
                        </span>
                        <p className="text-xs font-cinzel font-bold text-gold drop-shadow leading-tight line-clamp-2">
                          {monster.name}
                        </p>
                        <p className="text-[9px] text-gold/40 font-mono truncate mt-0.5">
                          {monster.fileName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
