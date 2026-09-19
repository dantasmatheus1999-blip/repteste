import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  Plus, 
  Sparkles, 
  Skull, 
  Shield, 
  Heart, 
  Sword, 
  Eye, 
  Trash2, 
  ChevronRight,
  RefreshCw,
  Zap,
  Filter,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MasterService } from '../../services/masterService';
import { NPC } from '../../types/master';
import { GeneratedMonster } from '../../services/monsterGeneratorService';
import { MonsterGeneratorCard } from '../master/monster-generator/MonsterGeneratorCard';
import { DEFAULT_NEUTRAL_MONSTER_IMAGE } from '../master/monster-generator/monsterImageLibrary';
import { MonsterForm } from '../../pages/master/MonsterForm';
import { MonsterDetailsPage } from '../../pages/master/MonsterDetailsPage';

interface MapBestiaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
}

const RANKS = ['Todos', 'Lacaio', 'Solo', 'Elite', 'Chefe'] as const;

export const MapBestiaryDrawer: React.FC<MapBestiaryDrawerProps> = ({
  isOpen,
  onClose,
  campaignId
}) => {
  const { user } = useAuth();
  const [monsters, setMonsters] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('Todos');
  
  // Subview modal state: 'list' | 'generate' | 'new' | 'edit' | 'details'
  const [activeSubView, setActiveSubView] = useState<'list' | 'generate' | 'new' | 'edit' | 'details'>('list');
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);
  const [monsterToDelete, setMonsterToDelete] = useState<NPC | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Subscribe to real monsters
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    let unsubscribe: () => void;

    if (campaignId) {
      unsubscribe = MasterService.subscribeToNPCs(
        campaignId,
        (data) => {
          setMonsters(data);
          setLoading(false);
        },
        'monster'
      );
    } else {
      unsubscribe = MasterService.subscribeToAllNPCs(
        user.uid,
        (data) => {
          setMonsters(data);
          setLoading(false);
        },
        'monster'
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, campaignId]);

  // Flash message helper
  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 3500);
  };

  // Filtered monsters list
  const filteredMonsters = useMemo(() => {
    return monsters.filter((m) => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.race && m.race.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.role && m.role.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRank = 
        selectedRank === 'Todos' || 
        (m.rank && m.rank.toLowerCase() === selectedRank.toLowerCase());

      return matchesSearch && matchesRank;
    });
  }, [monsters, searchTerm, selectedRank]);

  // Handle saving generated monster from MonsterGeneratorCard
  const handleSaveGeneratedMonster = async (generated: GeneratedMonster) => {
    if (!user) return;
    try {
      const monsterData: Partial<NPC> = {
        name: generated.name,
        race: generated.type,
        role: generated.role,
        combatRole: generated.combatRole,
        realmorScale: generated.realmorScale || (generated.rank as any) || 'normal',
        rank: generated.rank,
        nd: generated.nd,
        theme: generated.theme,
        environment: generated.environment,
        tactics: generated.tactics,
        speed: generated.speed,
        senses: generated.senses,
        personality: generated.description,
        description: `Rank: ${generated.rank} | Papel: ${generated.combatRole || generated.role} | ND: ${generated.nd} | Tema: ${generated.theme}\n\nAmbiente: ${generated.environment}\n\nTáticas: ${generated.tactics}\n\nHabilidades: ${generated.abilities.join(', ')}`,
        attitude: 'hostile',
        category: 'monster',
        imageUrl: generated.imageUrl || DEFAULT_NEUTRAL_MONSTER_IMAGE,
        campaignId: campaignId || '',
        isFavorite: false,
        combatProfile: generated.combatProfile,
        weaknesses: generated.weaknesses || [],
        advantages: generated.advantages || [],
        synergy: generated.synergy,
        actions: generated.attacks.map(attack => ({
          name: attack.split(' — ')[0],
          description: attack
        })),
        abilities: generated.abilities.map(ability => {
          const parts = ability.split(': ');
          return {
            name: parts[0] || 'Habilidade',
            description: parts.slice(1).join(': ') || ability,
            type: 'Habilidade'
          };
        }),
        spells: generated.spells || [],
        bossResources: generated.bossResources || [],
        specialActions: generated.specialActions || [],
        manaPoints: generated.manaPoints ?? (generated.spells && generated.spells.length > 0 ? 3 : 0),
        saveDC: generated.saveDC,
        fortitude: generated.fortitude,
        reflexes: generated.reflexes,
        will: generated.will,
        targetDamage: generated.targetDamage,
        tableReference: generated.tableReference,
        auditLog: generated.auditLog,
        validation: generated.validation,
        stats: {
          hp: generated.hp,
          mp: generated.manaPoints ?? 0,
          ac: generated.defense,
          str: generated.attributes.str,
          dex: generated.attributes.dex,
          con: generated.attributes.con,
          int: generated.attributes.int,
          wis: generated.attributes.wis,
          cha: generated.attributes.cha,
        }
      };

      await MasterService.createNPC(user.uid, campaignId || null, monsterData as NPC);
      setActiveSubView('list');
      showNotification(`Criatura "${generated.name}" registrada com sucesso no Bestiário!`);
    } catch (err) {
      console.error('Error saving generated monster:', err);
    }
  };

  // Handle delete monster
  const confirmDeleteMonster = async () => {
    if (!monsterToDelete) return;
    setIsDeleting(true);
    try {
      await MasterService.deleteNPC(monsterToDelete.id);
      showNotification(`Criatura "${monsterToDelete.name}" removida do Bestiário.`);
      setMonsterToDelete(null);
    } catch (err) {
      console.error('Error deleting monster:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Docked Drawer Panel */}
      <aside 
        id="map-bestiary-drawer" 
        className="w-80 sm:w-96 h-full bg-stone-950 border-r border-amber-900/40 flex flex-col z-35 shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.85)] animate-in slide-in-from-left duration-200 select-none overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-amber-900/30 bg-stone-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-600/30 to-red-900/40 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(217,119,6,0.2)]">
              <span className="text-base leading-none">👹</span>
            </div>
            <div>
              <h2 className="text-xs font-cinzel font-black uppercase tracking-widest text-amber-300">
                Bestiário
              </h2>
              <p className="text-[10px] text-stone-400 font-cinzel italic">
                Codex Monstrorum • Mesa
              </p>
            </div>
          </div>
          <button
            id="btn-close-bestiary-drawer"
            onClick={onClose}
            className="p-1.5 rounded text-stone-400 hover:text-amber-200 hover:bg-stone-800/80 transition-colors"
            title="Fechar Bestiário"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Buttons Section */}
        <div className="p-3 border-b border-amber-900/20 bg-stone-900/40 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 font-cinzel flex items-center gap-1.5">
              <span>👹</span> MEUS MONSTROS ({filteredMonsters.length})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-generate-monster"
              onClick={() => setActiveSubView('generate')}
              className="px-2.5 py-2 bg-gradient-to-r from-amber-700/80 to-amber-900/80 hover:from-amber-600 hover:to-amber-800 text-amber-100 font-cinzel font-bold text-[10px] tracking-wider uppercase rounded border border-amber-500/50 shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Abrir Gerador Avançado de Monstros"
            >
              <Sparkles size={12} className="text-amber-300 shrink-0" />
              <span>Gerar Monstro</span>
            </button>

            <button
              id="btn-add-new-monster"
              onClick={() => setActiveSubView('new')}
              className="px-2.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-cinzel font-bold text-[10px] tracking-wider uppercase rounded border border-amber-600/40 hover:border-amber-500 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Cadastrar Nova Criatura"
            >
              <Plus size={12} className="text-amber-400 shrink-0" />
              <span>Nova Criatura</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 border-b border-amber-900/20 bg-stone-950/60 flex flex-col gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" size={13} />
            <input
              id="input-search-monsters"
              type="text"
              placeholder="Buscar monstro pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-stone-900/90 border border-amber-900/40 rounded text-xs text-amber-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Rank Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {RANKS.map((rk) => (
              <button
                key={rk}
                onClick={() => setSelectedRank(rk)}
                className={`px-2 py-0.5 rounded text-[9px] font-cinzel font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
                  selectedRank === rk
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-300'
                }`}
              >
                {rk}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Toast */}
        {actionSuccessMsg && (
          <div className="m-2 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-cinzel flex items-center gap-2 animate-in fade-in shrink-0">
            <Sparkles size={12} className="text-amber-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Monster Cards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-500 gap-2">
              <RefreshCw size={20} className="animate-spin text-amber-500/60" />
              <p className="text-[11px] font-cinzel">Invocando registros...</p>
            </div>
          ) : filteredMonsters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-stone-500 gap-3 border border-dashed border-stone-800 rounded-lg">
              <Skull size={28} className="text-stone-600" />
              <div>
                <p className="text-xs font-cinzel text-stone-400 font-bold">Nenhum monstro encontrado</p>
                <p className="text-[10px] text-stone-500 mt-1">
                  {searchTerm || selectedRank !== 'Todos' 
                    ? 'Ajuste os filtros ou crie uma nova criatura.'
                    : 'Gere um monstro ou adicione uma criatura para começar.'}
                </p>
              </div>
              <button
                onClick={() => setActiveSubView('generate')}
                className="mt-1 px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 rounded text-[10px] font-cinzel font-bold uppercase tracking-wider"
              >
                ✨ Gerar Primeiro Monstro
              </button>
            </div>
          ) : (
            filteredMonsters.map((monster) => {
              const ndVal = monster.nd || '1';
              const hpVal = monster.stats?.hp ?? (monster as any).hp ?? '-';
              const acVal = monster.stats?.ac ?? (monster as any).defense ?? '-';

              // Extração do Papel T20 real salvo/associado ao monstro (SOLO / LACAIO / ESPECIAL)
              const rawRole = (
                monster.combatRole || 
                (monster.role && ['solo', 'lacaio', 'especial'].includes(monster.role.toLowerCase()) ? monster.role : null) ||
                (monster.rank && ['solo', 'lacaio', 'especial'].includes(monster.rank.toLowerCase()) ? monster.rank : null) ||
                (monster.description?.match(/Papel:\s*(solo|lacaio|especial)/i)?.[1]) ||
                'solo'
              );
              const roleDisplay = rawRole.toUpperCase() === 'LACAIO' 
                ? 'LACAIO' 
                : rawRole.toUpperCase() === 'ESPECIAL' 
                  ? 'ESPECIAL' 
                  : 'SOLO';

              // Escala salva/associada (NORMAL / ELITE / CHEFE)
              const rawScale = (
                monster.realmorScale ||
                (monster.rank && ['normal', 'elite', 'chefe'].includes(monster.rank.toLowerCase()) ? monster.rank : null) ||
                (monster.description?.match(/Rank:\s*(normal|elite|chefe)/i)?.[1]) ||
                'NORMAL'
              );
              const scaleDisplay = rawScale.toUpperCase();

              // Tipo/Raça do monstro
              const raceDisplay = (monster.race || 'MONSTRO').toUpperCase();

              return (
                <div
                  key={monster.id}
                  className="group relative bg-stone-900/70 hover:bg-stone-900 border border-stone-800 hover:border-amber-600/50 rounded-lg p-2.5 transition-all shadow-md flex flex-col gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Thumbnail / Avatar */}
                    <div className="w-11 h-11 rounded border border-amber-900/40 bg-stone-950 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
                      {monster.imageUrl ? (
                        <img 
                          src={monster.imageUrl} 
                          alt={monster.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-lg">🐺</span>
                      )}
                    </div>

                    {/* Basic Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h3 className="text-xs font-cinzel font-bold text-amber-200 truncate group-hover:text-amber-300">
                          {monster.name}
                        </h3>
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-black text-amber-400 font-cinzel shrink-0">
                          ND {ndVal}
                        </span>
                      </div>

                      <p className="text-[10px] text-stone-400 font-cinzel truncate mt-0.5">
                        {raceDisplay} • {scaleDisplay} • {roleDisplay}
                      </p>

                      {/* Quick stat preview */}
                      <div className="flex items-center gap-2.5 mt-1 text-[9px] text-stone-400">
                        <span className="flex items-center gap-0.5 text-red-400/90 font-mono">
                          <Heart size={9} /> {hpVal} PV
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-400/90 font-mono">
                          <Shield size={9} /> {acVal} CA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 gap-2">
                    <button
                      id={`btn-open-monster-${monster.id}`}
                      onClick={() => {
                        setSelectedMonsterId(monster.id);
                        setActiveSubView('details');
                      }}
                      className="flex-1 py-1 px-2 rounded bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40 hover:border-amber-500 text-amber-300 text-[10px] font-cinzel font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye size={11} />
                      <span>ABRIR</span>
                    </button>

                    <button
                      id={`btn-delete-monster-${monster.id}`}
                      onClick={() => setMonsterToDelete(monster)}
                      className="p-1 rounded text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors"
                      title="Excluir Criatura"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Compact Floating Modal for Monster Generator */}
      {activeSubView === 'generate' && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveSubView('list');
          }}
        >
          <div className="relative w-full max-w-xl flex justify-center">
            <MonsterGeneratorCard 
              onSave={handleSaveGeneratedMonster}
              onClose={() => setActiveSubView('list')}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Embedded Sub-View Modal Overlay for Form and Details */}
      {(activeSubView === 'new' || activeSubView === 'edit' || activeSubView === 'details') && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveSubView('list');
          }}
        >
          <div className="relative w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] h-full bg-stone-950 border-2 border-amber-700/50 rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
            {/* Modal Top Bar */}
            <div className="px-4 py-3 bg-stone-900/95 border-b border-amber-900/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubView('list')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-cinzel font-bold uppercase tracking-wider border border-amber-900/30 transition-colors"
                >
                  <ArrowLeft size={13} />
                  <span>Voltar à Mesa</span>
                </button>

                <div className="h-4 w-px bg-amber-900/40 mx-1" />

                <span className="text-xs font-cinzel font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <span>👹</span>
                  {activeSubView === 'new' && 'Cadastrar Nova Criatura'}
                  {activeSubView === 'edit' && 'Editar Criatura'}
                  {activeSubView === 'details' && 'Ficha Completa da Criatura'}
                </span>
              </div>

              <button
                onClick={() => setActiveSubView('list')}
                className="p-1.5 rounded-lg text-stone-400 hover:text-amber-200 hover:bg-stone-800 transition-colors"
                title="Fechar e voltar à Mesa"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 custom-scrollbar">
              {activeSubView === 'new' && (
                <MonsterForm 
                  customCampaignId={campaignId}
                  isEmbedded={true}
                  onSaveSuccess={() => {
                    setActiveSubView('list');
                    showNotification('Criatura adicionada ao Bestiário com sucesso!');
                  }}
                  onCancel={() => setActiveSubView('list')}
                />
              )}

              {activeSubView === 'edit' && selectedMonsterId && (
                <MonsterForm 
                  customCampaignId={campaignId}
                  customMonsterId={selectedMonsterId}
                  isEmbedded={true}
                  onSaveSuccess={() => {
                    setActiveSubView('list');
                    showNotification('Alterações salvas com sucesso no Bestiário!');
                  }}
                  onCancel={() => setActiveSubView('list')}
                />
              )}

              {activeSubView === 'details' && selectedMonsterId && (
                <MonsterDetailsPage 
                  customCampaignId={campaignId}
                  customMonsterId={selectedMonsterId}
                  isEmbedded={true}
                  onClose={() => setActiveSubView('list')}
                  onEdit={(id) => {
                    setSelectedMonsterId(id);
                    setActiveSubView('edit');
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {monsterToDelete && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-red-900/50 rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-400">
              <Skull size={22} />
              <h3 className="font-cinzel font-bold text-base text-red-200">Excluir Criatura?</h3>
            </div>
            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              Deseja remover <strong className="text-amber-300">{monsterToDelete.name}</strong> do Bestiário? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setMonsterToDelete(null)}
                className="px-3 py-1.5 text-xs rounded font-cinzel text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteMonster}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs rounded bg-red-900/80 hover:bg-red-800 text-red-100 font-cinzel font-bold border border-red-700/50 shadow transition-colors"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
