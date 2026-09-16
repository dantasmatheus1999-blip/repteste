import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown, ScrollText, Check, ChevronLeft } from 'lucide-react';
import { T20_CLASSES_DETAILED } from '../data/t20ClassesDetailed';
import { ClassCard } from '../components/classes/ClassCard';
import { ClassComparisonModal } from '../components/classes/ClassComparisonModal';
import { ClassCategory, Difficulty } from '../types/classes';
import { Button } from '../components/Button';

export const ClassesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClassCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const filteredClasses = useMemo(() => {
    return T20_CLASSES_DETAILED.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || c.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const toggleCompare = () => {
    setCompareMode(!compareMode);
    setSelectedForCompare([]);
  };

  const handleClassClick = (id: string, slug: string) => {
    if (compareMode) {
      if (selectedForCompare.includes(id)) {
        setSelectedForCompare(prev => prev.filter(i => i !== id));
      } else if (selectedForCompare.length < 2) {
        setSelectedForCompare(prev => [...prev, id]);
      }
    } else {
      navigate(`/codex/classes/${slug}`);
    }
  };

  const comparisonData = useMemo(() => {
    if (selectedForCompare.length !== 2) return null;
    return selectedForCompare.map(id => T20_CLASSES_DETAILED.find(c => c.id === id)!);
  }, [selectedForCompare]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      {/* Comparison Overlay */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] glass-card p-4 border-2 border-gold shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center gap-6 animate-in slide-in-from-bottom-10 duration-500">
          <div className="flex gap-4">
            {selectedForCompare.map(id => {
              const c = T20_CLASSES_DETAILED.find(x => x.id === id);
              return (
                <div key={id} className="flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 rounded-sm">
                  <span className="text-xs font-cinzel text-gold">{c?.name}</span>
                  <button onClick={() => setSelectedForCompare(prev => prev.filter(i => i !== id))} className="text-gold/40 hover:text-health">
                    <X size={14} />
                  </button>
                </div>
              );
            })}
            {selectedForCompare.length < 2 && (
              <div className="px-3 py-1 border border-dashed border-gold/20 rounded-sm text-[10px] text-gold/20 flex items-center">
                Selecione mais uma...
              </div>
            )}
          </div>
          {selectedForCompare.length === 2 && (
            <Button size="sm" onClick={() => setShowComparison(true)}>Comparar Agora</Button>
          )}
          <button onClick={toggleCompare} className="text-gold/40 hover:text-gold text-xs font-bold uppercase tracking-widest ml-4">Cancelar</button>
        </div>
      )}

      {/* Comparison Modal */}
      <ClassComparisonModal 
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        classes={comparisonData || []}
      />

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
              <ScrollText size={20} className="sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-cinzel text-gold-gradient drop-shadow-lg tracking-tighter">Classes</h2>
          </div>
          <p className="text-gold/40 text-xs sm:text-sm font-medium tracking-widest italic font-cinzel">"O compêndio sagrado dos caminhos de Arton."</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto relative z-10">
          <Button 
            variant={compareMode ? 'primary' : 'secondary'} 
            size="sm" 
            icon={ArrowUpDown} 
            className="flex-1 md:flex-none"
            onClick={toggleCompare}
          >
            {compareMode ? 'Sair da Comparação' : 'Comparar'}
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Buscar pelo nome ou essência..."
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
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`px-8 py-4 rounded-sm border-2 flex items-center gap-3 transition-all duration-500 relative overflow-hidden group ${
            showFilters ? 'bg-gold text-mythos-bg border-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'bg-mythos-card/50 border-gold/10 text-gold hover:border-gold/40'
          }`}
        >
          <div className="absolute inset-0 bg-gold/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <SlidersHorizontal size={20} className="relative z-10" />
          <span className="font-cinzel font-bold uppercase tracking-[0.2em] text-sm relative z-10">Filtros</span>
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-4">
            <label className="text-[10px] uppercase text-gold/40 font-bold tracking-[0.2em]">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'combatente', 'conjurador', 'especialista', 'suporte', 'hibrido'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as any)}
                  className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest border-2 transition-all ${
                    selectedCategory === cat 
                      ? 'bg-gold/20 border-gold text-gold' 
                      : 'bg-black/20 border-gold/10 text-gold/40 hover:border-gold/30'
                  }`}
                >
                  {cat === 'all' ? 'Todas' : cat}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] uppercase text-gold/40 font-bold tracking-[0.2em]">Dificuldade</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'iniciante', 'intermediario', 'avancado'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff as any)}
                  className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest border-2 transition-all ${
                    selectedDifficulty === diff 
                      ? 'bg-gold/20 border-gold text-gold' 
                      : 'bg-black/20 border-gold/10 text-gold/40 hover:border-gold/30'
                  }`}
                >
                  {diff === 'all' ? 'Todas' : diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {filteredClasses && filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClasses.map(c => (
            <div key={c.id} className="relative">
              <ClassCard 
                classData={c} 
                onClick={() => handleClassClick(c.id, c.slug)}
              />
              {compareMode && (
                <div 
                  onClick={() => handleClassClick(c.id, c.slug)}
                  className={`absolute inset-0 z-10 cursor-pointer rounded-lg border-4 transition-all ${
                    selectedForCompare.includes(c.id) 
                      ? 'border-gold bg-gold/5' 
                      : 'border-transparent hover:border-gold/20'
                  }`}
                >
                  <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedForCompare.includes(c.id) ? 'bg-gold border-gold text-mythos-bg' : 'border-gold/20 bg-black/40'
                  }`}>
                    {selectedForCompare.includes(c.id) && <Check size={14} />}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-6 rounded-full bg-gold/5 border-2 border-gold/10 text-gold/20">
            <Search size={48} />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-cinzel text-gold/60">Nenhum caminho encontrado</h3>
            <p className="text-gold/30 italic">"Talvez este conhecimento ainda não tenha sido revelado..."</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setSelectedDifficulty('all');
          }}>Limpar Filtros</Button>
        </div>
      )}
    </div>
  );
};
