import React, { useState } from 'react';
import { X, Search, Filter, Info, Check } from 'lucide-react';
import { T20_CLASSES_DETAILED } from '../../data/t20ClassesDetailed';
import { Button } from '../Button';
import { ClassCategory } from '../../types/classes';

interface ClassPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (classId: string) => void;
  currentClassId?: string;
}

export const ClassPickerModal: React.FC<ClassPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentClassId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClassCategory | 'all'>('all');

  if (!isOpen) return null;

  const filteredClasses = T20_CLASSES_DETAILED.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] flex flex-col border-2 border-gold/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gold/20 flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
          <div>
            <h2 className="text-3xl font-cinzel text-gold-gradient">Escolha sua Classe</h2>
            <p className="text-xs text-gold/40 uppercase tracking-widest font-bold">O destino do seu herói começa aqui</p>
          </div>
          <button onClick={onClose} className="p-2 text-gold/40 hover:text-gold transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-mythos-bg/50 border-b border-gold/10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/30" size={18} />
            <input 
              type="text"
              placeholder="Buscar classe..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-gold/20 rounded-sm py-2 pl-10 pr-4 text-gold outline-none focus:border-gold/50 transition-colors font-cinzel"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'combatente', 'conjurador', 'especialista', 'suporte'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`px-4 py-2 rounded-sm border text-[10px] uppercase font-bold tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-gold text-mythos-bg border-gold' 
                    : 'bg-gold/5 text-gold/60 border-gold/20 hover:border-gold/40'
                }`}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
          {filteredClasses.map((c) => (
            <div 
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`glass-card p-5 cursor-pointer transition-all group relative overflow-hidden border-2 ${
                currentClassId === c.id 
                  ? 'border-gold ring-2 ring-gold/30 bg-gold/5' 
                  : 'border-gold/10 hover:border-gold/40 hover:translate-y-[-4px]'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                  <Info size={24} />
                </div>
                {currentClassId === c.id && (
                  <div className="bg-gold text-mythos-bg p-1 rounded-full">
                    <Check size={16} />
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-cinzel text-gold mb-1">{c.name}</h3>
              <p className="text-[10px] text-gold/40 uppercase font-bold tracking-widest mb-3">{c.role}</p>
              
              <p className="text-xs text-mythos-text/70 line-clamp-3 mb-4 italic leading-relaxed">
                "{c.summary}"
              </p>

              <div className="flex flex-wrap gap-2">
                {c.primaryAttributes.map(attr => (
                  <span key={attr} className="text-[9px] bg-gold/10 text-gold px-2 py-0.5 rounded-sm border border-gold/20 font-bold">
                    {attr}
                  </span>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gold/20 bg-mythos-bg text-center">
          <p className="text-[10px] text-gold/30 uppercase tracking-[0.3em] font-bold">REALMOR • Tormenta 20</p>
        </div>
      </div>
    </div>
  );
};
