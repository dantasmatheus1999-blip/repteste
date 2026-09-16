import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, Map, X } from 'lucide-react';
import { T20_ORIGINS } from '../data/t20Origins';
import { OriginCard } from '../components/codex/OriginCard';

export const OriginsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrigins = useMemo(() => {
    return T20_ORIGINS.filter(o => 
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Back to Codex */}
      <button 
        onClick={() => navigate('/codex')}
        className="flex items-center gap-2 text-gold/40 hover:text-gold transition-colors group mb-4"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Voltar ao Codex</span>
      </button>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Map size={20} className="sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-cinzel text-gold-gradient drop-shadow-lg tracking-tighter">Origens</h2>
          </div>
          <p className="text-gold/40 text-xs sm:text-sm font-medium tracking-widest italic font-cinzel">"Onde sua jornada começou."</p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Buscar origem pelo nome ou história..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/40 border-2 border-gold/10 rounded-sm py-4 pl-12 pr-4 text-gold outline-none focus:border-gold/40 focus:bg-black/60 transition-all font-cinzel placeholder:text-gold/20 shadow-inner"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/40 hover:text-gold"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Results Grid */}
      {filteredOrigins && filteredOrigins.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrigins.map(o => (
            <OriginCard 
              key={o.id} 
              origin={o} 
              onClick={() => navigate(`/codex/origens/${o.slug}`)} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-6 rounded-full bg-gold/5 border-2 border-gold/10 text-gold/20">
            <Search size={48} />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-cinzel text-gold/60">Nenhum passado encontrado</h3>
            <p className="text-gold/30 italic">"Talvez esta história ainda não tenha sido escrita..."</p>
          </div>
        </div>
      )}
    </div>
  );
};
