// Módulo legado preservado como rascunho para consulta futura.
// Não excluir sem autorização.

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  ChevronLeft,
  Search,
  Filter,
  BookOpen,
  Skull,
  Zap,
  ChevronRight,
  ChevronDown,
  Sword,
  Dices,
  Heart,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { MasterService } from '../../services/masterService';
import { NPC } from '../../types/master';
import { Button } from '../../components/Button';
import { MonsterGeneratorCard } from '../../components/master/monster-generator/MonsterGeneratorCard';
import { GeneratedMonster } from '../../services/monsterGeneratorService';

export const BestiaryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { campaignId } = useParams<{ campaignId: string }>();
  
  const [monsters, setMonsters] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'generator'>('list');
  const [monsterToDelete, setMonsterToDelete] = useState<NPC | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user && campaignId) {
      const unsubscribe = MasterService.subscribeToNPCs(campaignId, (data) => {
        setMonsters(data);
        setLoading(false);
      }, 'monster');
      return () => unsubscribe();
    } else if (user && !campaignId) {
      const unsubscribe = MasterService.subscribeToAllNPCs(user.uid, (data) => {
        setMonsters(data);
        setLoading(false);
      }, 'monster');
      return () => unsubscribe();
    }
  }, [user, campaignId]);

  const handleSaveMonster = async (monster: GeneratedMonster) => {
    if (!user) return;
    
    try {
      const monsterData: Partial<NPC> = {
        name: monster.name,
        race: monster.type,
        role: monster.role,
        personality: monster.description,
        description: `Rank: ${monster.rank} | ND: ${monster.nd} | Tema: ${monster.theme}\n\nAmbiente: ${monster.environment}\n\nTáticas: ${monster.tactics}\n\nHabilidades: ${monster.abilities.join(', ')}`,
        attitude: 'hostile',
        category: 'monster',
        campaignId: campaignId || '',
        isFavorite: false,
        nd: monster.nd,
        rank: monster.rank,
        combatProfile: monster.combatProfile,
        weaknesses: monster.weaknesses,
        advantages: monster.advantages,
        synergy: monster.synergy,
        actions: monster.attacks.map(attack => ({
          name: attack.split(' — ')[0],
          description: attack
        })),
        stats: {
          hp: monster.hp,
          mp: 0,
          ac: monster.defense,
          str: monster.attributes.str,
          dex: monster.attributes.dex,
          con: monster.attributes.con,
          int: monster.attributes.int,
          wis: monster.attributes.wis,
          cha: monster.attributes.cha,
        }
      };
      
      await MasterService.createNPC(user.uid, campaignId || null, monsterData as NPC);
      setActiveTab('list');
    } catch (error) {
      console.error('Error saving monster:', error);
    }
  };

  const handleDeleteMonster = async () => {
    if (!monsterToDelete) return;
    setIsDeleting(true);
    try {
      await MasterService.deleteNPC(monsterToDelete.id);
      setMonsterToDelete(null);
    } catch (error) {
      console.error('Error deleting monster:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMonsters = monsters.filter(monster => {
    const matchesSearch = monster.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         monster.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         monster.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = rankFilter === 'all' || (monster as any).rank?.toLowerCase() === rankFilter.toLowerCase();
    return matchesSearch && matchesRank;
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto px-4 pb-32">
      {/* Header Section */}
      <div className="relative pt-8 pb-12 border-b border-gold/10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <button 
              onClick={() => campaignId ? navigate(`/master/campaigns/${campaignId}`) : navigate('/master')}
              className="group flex items-center gap-2 text-gold/40 hover:text-gold transition-all text-[10px] uppercase tracking-[0.3em] font-black mb-4"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Grimório
            </button>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h2 className="text-5xl md:text-6xl font-cinzel text-gold-gradient font-black tracking-widest drop-shadow-2xl">
                  Bestiário
                </h2>
                <div className="px-3 py-1 rounded-sm bg-gold/5 border border-gold/20 text-[10px] text-gold/40 uppercase font-black tracking-[0.3em]">
                  Codex Monstrorum
                </div>
              </div>
              <p className="text-gold/40 font-cinzel italic text-lg max-w-2xl leading-relaxed">
                "O registro das criaturas mais temíveis e fascinantes que habitam as terras de Arton."
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <Button 
              variant="secondary" 
              size="sm" 
              icon={Plus} 
              onClick={() => navigate(campaignId ? `/master/campaigns/${campaignId}/monsters/new` : '/master/monsters/new')}
              className="text-[10px] font-black uppercase tracking-[0.2em]"
            >
              Nova Criatura
            </Button>
            <div className="flex p-1 bg-black/40 border border-gold/20 rounded-xl">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeTab === 'list' ? 'bg-gold text-mythos-bg shadow-lg' : 'text-gold/40 hover:text-gold'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeTab === 'generator' ? 'bg-gold text-mythos-bg shadow-lg' : 'text-gold/40 hover:text-gold'
                }`}
              >
                Gerador
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'generator' ? (
          <motion.div
            key="generator"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-cinzel text-gold/60 tracking-[0.2em] font-bold flex items-center gap-3">
                <Zap size={24} className="text-gold/40" /> Gerador de Criaturas
              </h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/20 to-transparent ml-6" />
            </div>
            
            <MonsterGeneratorCard onSave={handleSaveMonster} />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-12"
          >
            {/* Search & Filters */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-cinzel text-gold/60 tracking-[0.2em] font-bold flex items-center gap-3">
                  <Skull size={24} className="text-gold/40" /> Criaturas Registradas
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/20 to-transparent ml-6" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/20 group-focus-within:text-gold/60 transition-colors" size={20} />
                  <input 
                    type="text"
                    placeholder="Buscar por nome, tipo ou função..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border-2 border-gold/10 rounded-xl py-4 pl-12 pr-6 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 focus:bg-black/60 transition-all font-cinzel"
                  />
                </div>
                <div className="md:col-span-4 relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/20" size={18} />
                  <select 
                    value={rankFilter}
                    onChange={(e) => setRankFilter(e.target.value)}
                    className="w-full bg-black/40 border-2 border-gold/10 rounded-xl py-4 pl-12 pr-6 text-gold focus:outline-none focus:border-gold/40 focus:bg-black/60 transition-all text-xs uppercase tracking-[0.2em] font-black appearance-none cursor-pointer"
                  >
                    <option value="all">Todos os Ranks</option>
                    <option value="lacaio">Lacaios</option>
                    <option value="solo">Solo</option>
                    <option value="chefe">Chefes</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold/20">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </section>

            {/* Monster Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]"></div>
                <p className="text-gold/40 font-cinzel italic animate-pulse">Consultando os anais de Arton...</p>
              </div>
            ) : filteredMonsters.length === 0 ? (
              <div className="glass-card p-24 text-center space-y-8 border-dashed border-2 border-gold/10 bg-mythos-card/10">
                <div className="w-24 h-24 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center mx-auto text-gold/20">
                  <Skull size={48} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-cinzel text-gold/60 tracking-widest">Bestiário Deserto</h3>
                  <p className="text-gold/30 italic max-w-md mx-auto font-cinzel">
                    "Nenhuma criatura foi registrada ainda. Use o gerador para dar vida aos perigos de Arton."
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="secondary" size="lg" onClick={() => setActiveTab('generator')}>
                    Abrir Gerador de Monstros
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {filteredMonsters.map((monster, idx) => (
                  <motion.div 
                    key={monster.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(campaignId ? `/master/campaigns/${campaignId}/monsters/${monster.id}` : `/master/monsters/${monster.id}`)}
                    className="glass-card group relative flex flex-col min-h-[400px] rounded-2xl border-2 border-gold/20 hover:border-gold/60 transition-all duration-700 cursor-pointer overflow-hidden shadow-2xl hover:shadow-[0_0_60px_rgba(212,175,55,0.2)] active:scale-[0.98]"
                  >
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMonsterToDelete(monster);
                      }}
                      className="absolute top-4 right-4 z-30 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full border border-red-500/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>

                    {/* Monster Image */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden">
                      {monster.imageUrl ? (
                        <img 
                          src={monster.imageUrl} 
                          alt={monster.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-mythos-bg/60 flex items-center justify-center relative">
                          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]" />
                          <Skull size={24} className="text-gold/10 w-24 h-24 relative z-10" />
                        </div>
                      )}
                      
                      {/* Image Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-mythos-bg via-transparent to-transparent opacity-80" />
                      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]" />
                      
                      {/* Name & Type Overlaid */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">
                            {(monster as any).rank || 'Criatura'}
                          </span>
                        </div>
                        <h4 className="text-3xl font-cinzel font-black text-gold drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] leading-tight tracking-wider">
                          {monster.name}
                        </h4>
                      </div>
                    </div>

                    {/* Monster Info */}
                    <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-mythos-card/60 to-mythos-bg/90 border-t border-gold/20">
                      <div className="space-y-2">
                        <p className="text-[10px] text-gold/40 font-black tracking-[0.3em] uppercase">
                          {monster.race} <span className="text-gold/10 mx-2">|</span> {monster.role}
                        </p>
                        <p className="text-xs text-gold/60 font-cinzel italic line-clamp-2 leading-relaxed">
                          {monster.personality || "Uma criatura perigosa que espreita nas sombras de Arton."}
                        </p>
                      </div>

                      <div className="flex justify-end items-center pt-4">
                        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-gold/20 bg-gold/5 text-gold group-hover:bg-gold group-hover:text-mythos-bg transition-all duration-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                          Ver Detalhes <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* Decorative Corner Accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/0 group-hover:border-gold/40 transition-all duration-700 rounded-tl-2xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/0 group-hover:border-gold/40 transition-all duration-700 rounded-br-2xl" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {monsterToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMonsterToDelete(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-mythos-bg border-2 border-gold/20 rounded-2xl p-8 shadow-2xl overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Skull size={120} />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4 text-red-500">
                  <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                    <Trash2 size={24} />
                  </div>
                  <h3 className="text-2xl font-cinzel font-black uppercase tracking-widest">Banir Criatura?</h3>
                </div>

                <p className="text-gold/60 font-cinzel italic leading-relaxed">
                  Tem certeza que deseja banir <span className="text-gold font-bold">"{monsterToDelete.name}"</span> das crônicas de Arton? Esta ação é irreversível e a criatura será perdida para sempre no abismo.
                </p>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setMonsterToDelete(null)}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 bg-red-500 hover:bg-red-600 border-red-500/50 text-white"
                    onClick={handleDeleteMonster}
                    loading={isDeleting}
                  >
                    Banir
                  </Button>
                </div>
              </div>

              {/* Decorative Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/20 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/20 rounded-br-2xl" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
