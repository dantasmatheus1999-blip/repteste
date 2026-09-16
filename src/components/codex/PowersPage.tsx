import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Shield, Target, Sparkles, Ghost, Zap, X } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { T20_POWERS } from '../../data/t20Powers';
import { PowerCard } from './PowerCard';
import { PowerDetailPage } from './PowerDetailPage';
import { T20Power, PowerCategory } from '../../types/powers';

const categories: { id: PowerCategory | 'todos'; label: string; icon: React.ReactNode }[] = [
  { id: 'todos', label: 'Todos', icon: <Search className="w-4 h-4" /> },
  { id: 'combate', label: 'Combate', icon: <Shield className="w-4 h-4" /> },
  { id: 'destino', label: 'Destino', icon: <Target className="w-4 h-4" /> },
  { id: 'magia', label: 'Magia', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'concedidos', label: 'Concedidos', icon: <Zap className="w-4 h-4" /> },
  { id: 'tormenta', label: 'Tormenta', icon: <Ghost className="w-4 h-4" /> },
];

export const PowersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPower, setSelectedPower] = useState<T20Power | null>(null);
  
  const activeCategory = (searchParams.get('categoria') as PowerCategory | 'todos') || 'todos';
  const powerSlug = searchParams.get('poder');

  useEffect(() => {
    if (powerSlug) {
      const power = T20_POWERS.find(p => p.slug === powerSlug);
      if (power) setSelectedPower(power);
    }
  }, [powerSlug]);

  const filteredPowers = useMemo(() => {
    return T20_POWERS.filter(power => {
      const matchesCategory = activeCategory === 'todos' || power.category === activeCategory;
      const matchesSearch = power.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          power.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          power.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCategoryChange = (categoryId: string) => {
    setSearchParams(prev => {
      if (categoryId === 'todos') {
        prev.delete('categoria');
      } else {
        prev.set('categoria', categoryId);
      }
      return prev;
    });
  };

  const handlePowerClick = (power: T20Power) => {
    setSelectedPower(power);
    setSearchParams(prev => {
      prev.set('poder', power.slug);
      return prev;
    });
  };

  const handleCloseDetail = () => {
    setSelectedPower(null);
    setSearchParams(prev => {
      prev.delete('poder');
      return prev;
    });
  };

  const handleViewDeity = (deityId: string) => {
    navigate(`/codex/divindades/${deityId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-amber-100 mb-2">Poderes de Arton</h1>
          <p className="text-white/60">Explore as habilidades e dons que moldam os heróis do mundo.</p>
        </div>

        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar poder, efeito ou tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500/50 text-white placeholder:text-white/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-white/40"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 p-1 bg-black/20 rounded-2xl border border-white/5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300
              ${activeCategory === cat.id 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5'}
            `}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tormenta Global Rule */}
      {activeCategory === 'tormenta' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-100/90"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-500/20 text-red-400">
              <Ghost className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-red-400 mb-2">Atenção aos Poderes da Tormenta</h3>
              <p className="text-sm leading-relaxed opacity-80">
                Adquirir um poder da Tormenta resulta na perda de 1 ponto de Carisma. 
                Para cada dois outros poderes da Tormenta adquiridos, a perda de Carisma aumenta em mais 1 ponto. 
                Se o Carisma do personagem cair abaixo de -5, ele se torna um NPC.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPowers.map((power) => (
            <PowerCard
              key={power.id}
              power={power}
              onClick={handlePowerClick}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPowers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 glass-card border-dashed border-white/10"
        >
          <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
            <Sparkles className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-xl font-serif text-white/60">Nenhum poder cadastrado ainda</h3>
          <p className="text-white/40">A base de dados está sendo atualizada.</p>
        </motion.div>
      )}

      {/* Detail Modal */}
      <PowerDetailPage
        power={selectedPower}
        onClose={handleCloseDetail}
        onViewDeity={handleViewDeity}
      />
    </div>
  );
};
