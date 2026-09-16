import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Wand2, 
  Search, 
  ChevronRight, 
  BookOpen, 
  Sparkles,
  Flame,
  Shield,
  Eye,
  Ghost,
  Zap,
  RotateCcw,
  Star,
  Skull,
  X,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { T20_SPELLS } from '../../data/t20Spells';
import { SpellType, SpellSchool, T20Spell } from '../../types/spells';

const SCHOOL_ICONS: Record<SpellSchool, any> = {
  'Abjuração': Shield,
  'Adivinhação': Eye,
  'Convocação': Ghost,
  'Encantamento': Sparkles,
  'Evocação': Flame,
  'Ilusão': Ghost,
  'Necromancia': Skull,
  'Transmutação': Zap,
  'Universal': Star
};

const ITEMS_PER_PAGE = 20;

// Helper to normalize text (lowercase, remove accents)
const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Keyword mapping for conceptual search
const SPELL_KEYWORDS: Record<string, string[]> = {
  'cura': ['curar', 'regeneração', 'restaurar', 'vida', 'pv', 'ferimentos', 'vitalidade'],
  'fogo': ['chama', 'chamas', 'queimadura', 'explosão', 'incêndio', 'calor'],
  'gelo': ['frio', 'congelar', 'neve', 'geada', 'inverno'],
  'trevas': ['necromancia', 'morto-vivo', 'escuridão', 'sombra', 'morte', 'caveira'],
  'defesa': ['proteção', 'escudo', 'resistência', 'armadura', 'bloqueio', 'abjuração'],
  'mover': ['velocidade', 'voo', 'teletransporte', 'deslocamento', 'salto', 'passo'],
  'ilusão': ['invisibilidade', 'disfarce', 'engano', 'imagem', 'aparência'],
  'controle': ['prender', 'agarrar', 'paralisar', 'imobilizar', 'confusão', 'atordoar'],
  'buff': ['bônus', 'fortalecimento', 'melhoria', 'auxílio', 'bênção'],
  'debuff': ['enfraquecer', 'penalidade', 'maldição', 'dreno', 'redução', 'cegueira', 'surdez'],
};

// Component to highlight search terms
const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!text) return null;
  if (!highlight || !highlight.trim()) return <>{text}</>;

  const normalizedText = normalizeText(text);
  const normalizedHighlight = normalizeText(highlight);
  
  const parts = [];
  let lastIndex = 0;
  let index = normalizedText.indexOf(normalizedHighlight);

  while (index !== -1) {
    // Add non-highlighted part
    if (index > lastIndex) {
      parts.push(text.substring(lastIndex, index));
    }
    // Add highlighted part
    parts.push(
      <span key={index} className="bg-gold/30 text-white font-bold rounded-sm px-0.5">
        {text.substring(index, index + highlight.length)}
      </span>
    );
    lastIndex = index + highlight.length;
    index = normalizedText.indexOf(normalizedHighlight, lastIndex);
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};

const SpellModal = ({ 
  spell, 
  onClose, 
  isFavorite, 
  onToggleFavorite 
}: { 
  spell: T20Spell; 
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) => {
  if (!spell) return null;
  const Icon = SCHOOL_ICONS[spell.school] || Wand2;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-8"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Content - Grimoire Style */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="relative w-full max-w-4xl h-[95vh] md:h-auto md:max-h-[90vh] bg-mythos-card border border-gold/20 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col rounded-sm"
      >
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-gold/30 pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-gold/30 pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-gold/30 pointer-events-none z-10" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-gold/30 pointer-events-none z-10" />

        {/* Fixed Header */}
        <div className="relative z-20 p-6 md:p-8 border-b border-gold/10 bg-black/40 backdrop-blur-sm shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div className="flex gap-5 items-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-sm bg-black/60 border border-gold/20 flex items-center justify-center text-gold shadow-[inset_0_0_15px_rgba(212,175,55,0.1)] shrink-0">
                <Icon size={32} strokeWidth={1} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl md:text-4xl font-cinzel text-gold uppercase tracking-[0.1em] leading-tight drop-shadow-sm">
                    {spell.name}
                  </h2>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(spell.id);
                    }}
                    className={`p-2 rounded-full transition-all ${isFavorite ? 'text-red-500 bg-red-500/10' : 'text-gold/20 hover:text-gold/40 hover:bg-gold/5'}`}
                    title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    <Heart size={22} className={isFavorite ? 'fill-red-500' : ''} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gold/60 font-cinzel text-[10px] md:text-xs tracking-widest uppercase">
                  <span className={spell.type === 'arcana' ? 'text-purple-400' : spell.type === 'divina' ? 'text-blue-400' : 'text-gold'}>
                    {spell.type}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gold/20" />
                  <span>{spell.circle}º Círculo</span>
                  <span className="w-1 h-1 rounded-full bg-gold/20" />
                  <span>{spell.school}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gold/30 hover:text-gold transition-colors hover:bg-gold/5 rounded-full"
            >
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          <div className="p-6 md:p-10 space-y-10">
            
            {/* Technical Block - Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 bg-black/30 p-6 md:p-8 border border-gold/10 relative overflow-hidden group">
              {/* Subtle background glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
              
              <div className="space-y-1.5">
                <p className="text-[9px] md:text-[10px] uppercase text-gold/40 font-bold tracking-[0.2em] font-cinzel">Execução</p>
                <p className="text-sm md:text-base text-gold/90 font-medium">{spell.execution}</p>
              </div>
              
              <div className="space-y-1.5">
                <p className="text-[9px] md:text-[10px] uppercase text-gold/40 font-bold tracking-[0.2em] font-cinzel">Alcance</p>
                <p className="text-sm md:text-base text-gold/90 font-medium">{spell.range}</p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] md:text-[10px] uppercase text-gold/40 font-bold tracking-[0.2em] font-cinzel">Duração</p>
                <p className="text-sm md:text-base text-gold/90 font-medium">{spell.duration}</p>
              </div>

              {(spell.target || spell.area || spell.effect) && (
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                  <p className="text-[9px] md:text-[10px] uppercase text-gold/40 font-bold tracking-[0.2em] font-cinzel">Alvo / Área / Efeito</p>
                  <p className="text-sm md:text-base text-gold/90 font-medium">{spell.target || spell.area || spell.effect}</p>
                </div>
              )}

              {spell.resistance && (
                <div className="space-y-1.5">
                  <p className="text-[9px] md:text-[10px] uppercase text-gold/40 font-bold tracking-[0.2em] font-cinzel">Resistência</p>
                  <p className="text-sm md:text-base text-gold/90 font-medium">{spell.resistance}</p>
                </div>
              )}
            </div>

            {/* Main Content Sections */}
            <div className="space-y-12 max-w-3xl mx-auto">
              
              {/* Description Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm md:text-base uppercase text-gold font-cinzel tracking-[0.4em] whitespace-nowrap">Descrição</h3>
                  <div className="h-px w-full bg-gradient-to-r from-gold/30 to-transparent" />
                </div>
                <div className="text-base md:text-lg text-mythos-text/90 leading-relaxed font-serif italic text-justify hyphens-auto space-y-4 px-1">
                  {spell.description.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="first-letter:text-3xl first-letter:font-cinzel first-letter:text-gold first-letter:mr-1 first-letter:float-left">
                      {paragraph.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()}
                    </p>
                  ))}
                </div>
              </section>

              {/* Trick Section */}
              {spell.truque && (
                <section className="space-y-6 bg-gold/5 p-6 md:p-8 border-l-2 border-gold/30">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm md:text-base uppercase text-gold font-cinzel tracking-[0.4em] whitespace-nowrap">Truque</h3>
                    <div className="h-px w-full bg-gradient-to-r from-gold/30 to-transparent" />
                  </div>
                  <p className="text-base md:text-lg text-gold/80 leading-relaxed italic font-serif">
                    {spell.truque}
                  </p>
                </section>
              )}

              {/* Enhancements Section */}
              {spell.aprimoramentos && spell.aprimoramentos.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm md:text-base uppercase text-gold font-cinzel tracking-[0.4em] whitespace-nowrap">Aprimoramentos</h3>
                    <div className="h-px w-full bg-gradient-to-r from-gold/30 to-transparent" />
                  </div>
                  <div className="space-y-6">
                    {spell.aprimoramentos.map((aprim, i) => (
                      <div key={i} className="group flex gap-4 items-start bg-black/10 p-4 rounded-sm border border-transparent hover:border-gold/10 transition-all">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-gold/40 group-hover:bg-gold transition-colors shrink-0" />
                        <p className="text-sm md:text-base text-mythos-text/80 leading-relaxed group-hover:text-gold transition-colors">
                          {aprim}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
          
          {/* Footer Ornament */}
          <div className="py-12 flex justify-center opacity-20">
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-black/40 border-t border-gold/10 flex justify-center shrink-0">
          <button 
            onClick={onClose}
            className="px-10 py-2.5 bg-gold/5 hover:bg-gold/10 border border-gold/20 hover:border-gold/40 text-gold text-[10px] uppercase font-bold tracking-[0.3em] transition-all rounded-sm"
          >
            Fechar Grimório
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const SpellsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mythos_favorites') || '[]');
    } catch (e) {
      return [];
    }
  });
  const observerTarget = useRef(null);

  useEffect(() => {
    localStorage.setItem('mythos_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const activeType = (searchParams.get('type') as SpellType) || 'arcana';
  const activeCircle = searchParams.get('circle') || '1'; // '1', '2', '3', '4', '5' or 'all'
  const activeSchool = searchParams.get('school') || 'all';

  const schools: SpellSchool[] = [
    'Abjuração', 'Adivinhação', 'Convocação', 'Encantamento', 
    'Evocação', 'Ilusão', 'Necromancia', 'Transmutação', 'Universal'
  ];

  const filteredSpells = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    return T20_SPELLS.filter(spell => {
      const isFav = favorites.includes(spell.id);
      if (activeCircle === 'favorites' && !isFav) return false;

      const matchesType = activeType === 'universal' ? spell.type === 'universal' : (spell.type === activeType || spell.type === 'universal');
      const matchesCircle = (activeCircle === 'all' || activeCircle === 'favorites') ? true : spell.circle === parseInt(activeCircle);
      const matchesSchool = activeSchool === 'all' ? true : spell.school === activeSchool;
      
      let matchesSearch = true;
      if (normalizedQuery) {
        // Check all fields
        const searchableFields = [
          spell.name,
          spell.type,
          `${spell.circle}º círculo`,
          spell.school,
          spell.execution,
          spell.range,
          spell.target || '',
          spell.area || '',
          spell.effect || '',
          spell.duration,
          spell.resistance || '',
          spell.description,
          spell.truque || '',
          ...(spell.aprimoramentos || [])
        ].map(normalizeText);

        // Check if query matches any field
        const directMatch = searchableFields.some(field => field.includes(normalizedQuery));
        
        // Check keywords
        let keywordMatch = false;
        for (const [concept, keywords] of Object.entries(SPELL_KEYWORDS)) {
          // If query matches a concept or its keywords
          if (normalizeText(concept).includes(normalizedQuery) || keywords.some(k => normalizeText(k).includes(normalizedQuery))) {
            // Check if spell description or name contains any of those keywords
            if (keywords.some(k => normalizeText(spell.name).includes(normalizeText(k)) || normalizeText(spell.description).includes(normalizeText(k)))) {
              keywordMatch = true;
              break;
            }
          }
        }

        matchesSearch = directMatch || keywordMatch;
      }
      
      return matchesType && matchesCircle && matchesSchool && matchesSearch;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [activeType, activeCircle, activeSchool, searchQuery, favorites]);

  const displayedSpells = filteredSpells.slice(0, visibleItems);

  const [selectedSpell, setSelectedSpell] = useState<T20Spell | null>(null);

  useEffect(() => {
    setVisibleItems(ITEMS_PER_PAGE);
  }, [activeType, activeCircle, activeSchool, searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleItems < filteredSpells.length) {
          setVisibleItems(prev => prev + ITEMS_PER_PAGE);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [visibleItems, filteredSpells.length]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' && key !== 'circle') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-gold">
            <Wand2 size={32} className="drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            <h1 className="text-4xl font-cinzel text-gold-gradient tracking-wider">Grimório de Arton</h1>
          </div>
          <p className="text-gold/60 italic font-medium">"Onde a vontade se torna realidade e o impossível ganha forma."</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40 group-focus-within:text-gold transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome, efeito ou palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-mythos-card/50 border-2 border-gold/10 rounded-sm py-3 pl-12 pr-12 text-gold focus:border-gold/40 focus:bg-mythos-card outline-none transition-all font-cinzel text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/40 hover:text-gold transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold/20 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
        </div>
      </div>

      {/* Main Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Type Selector (Arcana/Divina) */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] uppercase text-gold/40 font-bold tracking-[0.2em] ml-1">Natureza da Magia</label>
          <div className="flex bg-black/40 p-1 rounded-sm border border-gold/10">
            <button 
              onClick={() => updateFilter('type', 'arcana')}
              className={`flex-1 py-2 px-2 rounded-sm font-cinzel text-[10px] transition-all ${activeType === 'arcana' ? 'bg-gold text-mythos-bg font-bold shadow-lg' : 'text-gold/40 hover:text-gold/70'}`}
            >
              Arcana
            </button>
            <button 
              onClick={() => updateFilter('type', 'divina')}
              className={`flex-1 py-2 px-2 rounded-sm font-cinzel text-[10px] transition-all ${activeType === 'divina' ? 'bg-gold text-mythos-bg font-bold shadow-lg' : 'text-gold/40 hover:text-gold/70'}`}
            >
              Divina
            </button>
            <button 
              onClick={() => updateFilter('type', 'universal')}
              className={`flex-1 py-2 px-2 rounded-sm font-cinzel text-[10px] transition-all ${activeType === 'universal' ? 'bg-gold text-mythos-bg font-bold shadow-lg' : 'text-gold/40 hover:text-gold/70'}`}
            >
              Universal
            </button>
          </div>
        </div>

        {/* Circle Selector */}
        <div className="lg:col-span-6 flex flex-col gap-2">
          <label className="text-[10px] uppercase text-gold/40 font-bold tracking-[0.2em] ml-1">Círculo de Poder</label>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => updateFilter('circle', 'all')}
              className={`px-4 py-2 rounded-sm border-2 font-cinzel text-xs transition-all flex items-center gap-2 ${activeCircle === 'all' ? 'bg-gold/20 border-gold text-gold font-bold shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-mythos-card/40 border-gold/10 text-gold/40 hover:border-gold/30 hover:text-gold'}`}
            >
              <Sparkles size={14} className={activeCircle === 'all' ? 'animate-pulse' : ''} />
              Todas
            </button>
            <button 
              onClick={() => updateFilter('circle', 'favorites')}
              className={`px-4 py-2 rounded-sm border-2 font-cinzel text-xs transition-all flex items-center gap-2 ${activeCircle === 'favorites' ? 'bg-red-500/20 border-red-500 text-red-400 font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-mythos-card/40 border-gold/10 text-gold/40 hover:border-gold/30 hover:text-gold'}`}
            >
              <Heart size={14} className={activeCircle === 'favorites' ? 'fill-red-400' : ''} />
              Favoritas
            </button>
            {[1, 2, 3, 4, 5].map(circle => (
              <button 
                key={circle}
                onClick={() => updateFilter('circle', circle.toString())}
                className={`px-4 py-2 rounded-sm border-2 font-cinzel text-xs transition-all ${activeCircle === circle.toString() ? 'bg-gold/20 border-gold text-gold font-bold shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-mythos-card/40 border-gold/10 text-gold/40 hover:border-gold/30 hover:text-gold'}`}
              >
                {circle}º Círculo
              </button>
            ))}
          </div>
        </div>

        {/* School Selector */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] uppercase text-gold/40 font-bold tracking-[0.2em] ml-1">Escola Mística</label>
          <select 
            value={activeSchool}
            onChange={(e) => updateFilter('school', e.target.value)}
            className="w-full bg-mythos-card/50 border-2 border-gold/10 rounded-sm py-2 px-4 text-gold focus:border-gold/40 outline-none font-cinzel text-sm appearance-none cursor-pointer"
          >
            <option value="all">Todas as Escolas</option>
            {schools.map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Spells Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <AnimatePresence mode="popLayout">
          {displayedSpells.map((spell, index) => {
            const Icon = SCHOOL_ICONS[spell.school] || Wand2;
            const isFavorite = favorites.includes(spell.id);

            return (
              <motion.div
                key={spell.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index % 10 * 0.05 }}
                onClick={() => setSelectedSpell(spell)}
                className="group relative bg-mythos-card border border-gold/10 p-6 hover:border-gold/40 transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-hidden cursor-pointer"
              >
                {/* Background Ornament */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold/5 blur-2xl rounded-full group-hover:bg-gold/10 transition-colors" />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6">
                  <div className="w-12 h-12 rounded-sm bg-black/40 border border-gold/20 flex items-center justify-center text-gold group-hover:border-gold transition-colors shrink-0">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-cinzel text-gold group-hover:text-yellow-200 transition-colors uppercase tracking-wider truncate">
                            <HighlightText text={spell.name} highlight={searchQuery} />
                          </h3>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(spell.id);
                            }}
                            className={`p-1 rounded-full transition-all ${isFavorite ? 'text-red-500 bg-red-500/10' : 'text-gold/10 hover:text-gold/40 hover:bg-gold/5'}`}
                          >
                            <Heart size={14} className={isFavorite ? 'fill-red-500' : ''} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-gold/40">
                            <HighlightText text={spell.school} highlight={searchQuery} />
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gold/20" />
                          <span className="text-[9px] uppercase font-bold tracking-widest text-gold/40">{spell.circle}º Círculo</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-sm border font-bold uppercase tracking-tighter ${
                          spell.type === 'arcana' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 
                          spell.type === 'divina' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                          'bg-gold/10 border-gold/30 text-gold'
                        }`}>
                          {spell.type}
                        </span>
                        <ChevronRight size={16} className="text-gold/20 group-hover:text-gold transition-all group-hover:translate-x-1" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gold/5 grid grid-cols-2 gap-y-4 gap-x-6">
                      <div className="space-y-1">
                        <p className="text-[8px] uppercase text-gold/30 font-bold tracking-widest">Execução</p>
                        <p className="text-xs text-gold/70 truncate">
                          <HighlightText text={spell.execution} highlight={searchQuery} />
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] uppercase text-gold/30 font-bold tracking-widest">Alcance</p>
                        <p className="text-xs text-gold/70 truncate">
                          <HighlightText text={spell.range} highlight={searchQuery} />
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-center">
                      <span className="text-[8px] uppercase text-gold/20 font-bold tracking-widest group-hover:text-gold/40 transition-colors">Clique para ler no grimório</span>
                    </div>
                  </div>
                </div>

                {/* Corner Ornaments */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold/20" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold/20" />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredSpells.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-6 bg-black/20 rounded-sm border border-gold/5">
            <div className="w-24 h-24 bg-gold/5 rounded-full flex items-center justify-center mx-auto border border-gold/10 relative">
              <RotateCcw size={40} className="text-gold/20" />
              <div className="absolute inset-0 border-2 border-gold/5 rounded-full animate-ping" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-cinzel text-gold/60 uppercase tracking-widest">Nenhum mistério encontrado</h3>
              <p className="text-gold/30 text-sm max-w-md mx-auto italic">
                "As páginas do grimório permanecem em silêncio. Tente buscar por outros termos ou conceitos misticos."
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => {
                  setSearchParams({ type: activeType, circle: '1' });
                  setSearchQuery('');
                }}
                className="px-6 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-[10px] uppercase font-bold tracking-[0.2em] transition-all rounded-sm"
              >
                Limpar Filtros e Busca
              </button>
            </div>
          </div>
        )}

        {/* Observer Target for Infinite Scroll */}
        <div ref={observerTarget} className="h-10 col-span-full" />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedSpell && (
          <SpellModal 
            spell={selectedSpell} 
            onClose={() => setSelectedSpell(null)} 
            isFavorite={favorites.includes(selectedSpell.id)}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </AnimatePresence>

      {/* Loading Indicator for Infinite Scroll */}
      {visibleItems < filteredSpells.length && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-3 text-gold/40">
            <div className="w-2 h-2 bg-gold rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-gold rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-gold rounded-full animate-bounce" />
            <span className="text-xs font-cinzel uppercase tracking-widest ml-2">Revelando mais mistérios...</span>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      {filteredSpells.length > 0 && (
        <div className="fixed bottom-8 right-8 z-40">
          <div className="bg-mythos-card border border-gold/20 px-4 py-2 rounded-sm shadow-2xl backdrop-blur-md flex items-center gap-3">
            <div className="text-right">
              <p className="text-[8px] uppercase text-gold/40 font-bold tracking-widest">Grimório</p>
              <p className="text-xs font-medieval text-gold">
                {Math.min(visibleItems, filteredSpells.length)} / {filteredSpells.length}
              </p>
            </div>
            <div className="w-px h-6 bg-gold/10" />
            <BookOpen size={16} className="text-gold/60" />
          </div>
        </div>
      )}
    </div>
  );
};
