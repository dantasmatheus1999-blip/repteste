// Módulo legado preservado como rascunho para consulta futura.
// Não excluir sem autorização.

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  ChevronLeft,
  Search,
  Filter,
  MoreVertical,
  User,
  Heart,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { MasterService } from '../../services/masterService';
import { NPC } from '../../types/master';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export const NPCListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { campaignId } = useParams<{ campaignId: string }>();
  
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (user && campaignId) {
      const unsubscribe = MasterService.subscribeToNPCs(campaignId, (data) => {
        setNpcs(data);
        setLoading(false);
      }, 'npc');
      return () => unsubscribe();
    } else if (user && !campaignId) {
      // Global NPC list for the master
      const unsubscribe = MasterService.subscribeToAllNPCs(user.uid, (data) => {
        setNpcs(data);
        setLoading(false);
      }, 'npc');
      return () => unsubscribe();
    }
  }, [user, campaignId]);

  const filteredNpcs = npcs.filter(npc => {
    const matchesSearch = npc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         npc.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         npc.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || npc.role.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto px-4 pb-32">
      {/* Header Section - Enhanced */}
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
                  Habitantes
                </h2>
                <div className="px-3 py-1 rounded-sm bg-gold/5 border border-gold/20 text-[10px] text-gold/40 uppercase font-black tracking-[0.3em]">
                  Codex Arton
                </div>
              </div>
              <p className="text-gold/40 font-cinzel italic text-lg max-w-2xl leading-relaxed">
                "O registro de todos os habitantes e aliados que cruzaram seu caminho."
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <Button 
              icon={Plus} 
              onClick={() => navigate(campaignId ? `/master/campaigns/${campaignId}/npcs/new` : '/master/npcs/new')}
              className="flex-1 md:flex-none shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Novo Registro
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        {/* Search & Filters - Enhanced */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-cinzel text-gold/60 tracking-[0.2em] font-bold flex items-center gap-3">
              <BookOpen size={24} className="text-gold/40" /> Registros Existentes
            </h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/20 to-transparent ml-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/20 group-focus-within:text-gold/60 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Buscar por nome, raça ou função..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border-2 border-gold/10 rounded-xl py-4 pl-12 pr-6 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 focus:bg-black/60 transition-all font-cinzel"
              />
            </div>
            <div className="md:col-span-4 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/20" size={18} />
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-black/40 border-2 border-gold/10 rounded-xl py-4 pl-12 pr-6 text-gold focus:outline-none focus:border-gold/40 focus:bg-black/60 transition-all text-xs uppercase tracking-[0.2em] font-black appearance-none cursor-pointer"
              >
                <option value="all">Todas as Funções</option>
                <option value="aliado">Aliados</option>
                <option value="inimigo">Inimigos</option>
                <option value="neutro">Neutros</option>
                <option value="comerciante">Comerciantes</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold/20">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        </section>

        {/* NPC Grid - Enhanced Visuals */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]"></div>
            <p className="text-gold/40 font-cinzel italic animate-pulse">Consultando os anais de Arton...</p>
          </div>
        ) : filteredNpcs.length === 0 ? (
          <div className="glass-card p-24 text-center space-y-8 border-dashed border-2 border-gold/10 bg-mythos-card/10">
            <div className="w-24 h-24 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center mx-auto text-gold/20">
              <Users size={48} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-cinzel text-gold/60 tracking-widest">Vazio no Grimório</h3>
              <p className="text-gold/30 italic max-w-md mx-auto font-cinzel">
                "As tavernas e estradas de Arton parecem desertas... por enquanto. O destino aguarda sua pena."
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" onClick={() => navigate(campaignId ? `/master/campaigns/${campaignId}/npcs/new` : '/master/npcs/new')}>
                Registrar Primeiro Habitante
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {filteredNpcs.map((npc, idx) => (
              <motion.div 
                key={npc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(campaignId ? `/master/campaigns/${campaignId}/npcs/${npc.id}` : `/master/npcs/${npc.id}`)}
                className="glass-card group relative flex flex-col min-h-[400px] rounded-2xl border-2 border-gold/20 hover:border-gold/60 transition-all duration-700 cursor-pointer overflow-hidden shadow-2xl hover:shadow-[0_0_60px_rgba(212,175,55,0.2)] active:scale-[0.98]"
              >
                {/* NPC Image - Dominant */}
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  {npc.imageUrl ? (
                    <img 
                      src={npc.imageUrl} 
                      alt={npc.name} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-mythos-bg/60 flex items-center justify-center relative">
                      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]" />
                      <User size={24} className="text-gold/10 w-24 h-24 relative z-10" />
                    </div>
                  )}
                  
                  {/* Image Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-mythos-bg via-transparent to-transparent opacity-80" />
                  <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]" />
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {npc.isFavorite && (
                      <div className="p-2 rounded-full bg-red-900/40 border border-red-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                        <Heart size={16} className="text-red-500 fill-red-500" />
                      </div>
                    )}
                  </div>

                  {/* Name & Role Overlaid */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${
                        npc.attitude === 'friendly' ? 'bg-emerald-500 text-emerald-500' : 
                        npc.attitude === 'hostile' ? 'bg-red-500 text-red-500' : 'bg-gold/40 text-gold/40'
                      }`} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">
                        {npc.attitude === 'friendly' ? 'Amigável' : npc.attitude === 'hostile' ? 'Hostil' : 'Neutro'}
                      </span>
                    </div>
                    <h4 className="text-3xl font-cinzel font-black text-gold drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] leading-tight tracking-wider">
                      {npc.name}
                    </h4>
                  </div>
                </div>

                {/* NPC Info - Bottom Part */}
                <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-mythos-card/60 to-mythos-bg/90 border-t border-gold/20">
                  <div className="space-y-2">
                    <p className="text-[10px] text-gold/40 font-black tracking-[0.3em] uppercase">
                      {npc.race} <span className="text-gold/10 mx-2">|</span> {npc.role}
                    </p>
                    <p className="text-xs text-gold/60 font-cinzel italic line-clamp-2 leading-relaxed">
                      {npc.personality || "Um habitante misterioso de Arton com segredos a esconder."}
                    </p>
                  </div>

                  <div className="flex justify-end items-center pt-4">
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-gold/20 bg-gold/5 text-gold group-hover:bg-gold group-hover:text-mythos-bg transition-all duration-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                      Ver Grimório <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
    </div>
  );
};
