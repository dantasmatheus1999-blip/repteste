import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Sparkles } from 'lucide-react';
import { T20_DEITIES } from '../data/t20Deities';
import { DeityCard } from '../components/codex/DeityCard';

export const DeitiesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredDeities = useMemo(() => {
    return T20_DEITIES.filter(deity => 
      deity.name.toLowerCase().includes(search.toLowerCase()) ||
      deity.summary.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/codex')}
            className="flex items-center gap-2 text-gold/60 hover:text-gold transition-colors font-cinzel text-xs tracking-widest uppercase group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao Codex
          </button>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-cinzel text-gold-gradient tracking-tighter">Divindades</h1>
          <p className="text-gold/40 text-xs sm:text-sm font-medium tracking-wide">O Panteão de Arton e seus poderes concedidos.</p>
        </div>

        <div className="relative group max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Buscar divindade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-gold/20 rounded-sm py-3 pl-12 pr-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/50 transition-all font-cinzel tracking-wider"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredDeities && filteredDeities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDeities.map((deity) => (
            <DeityCard 
              key={deity.id} 
              deity={deity} 
              onClick={() => navigate(`/codex/divindades/${deity.slug}`)} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 glass-card medieval-border">
          <div className="w-16 h-16 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center text-gold/20">
            <Sparkles size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-gold/60 font-cinzel text-xl">Nenhuma divindade encontrada</p>
            <p className="text-gold/30 text-sm">Tente ajustar sua busca ou filtros.</p>
          </div>
        </div>
      )}
    </div>
  );
};
