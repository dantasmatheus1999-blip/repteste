import React from 'react';
import { X, Sword, Wand2, Heart, Shield, Zap, ScrollText, Star } from 'lucide-react';
import { T20ClassDetail } from '../../types/classes';
import { T20_CLASSES } from '../../data/t20Data';
import { Button } from '../Button';

interface ClassComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: T20ClassDetail[];
}

export const ClassComparisonModal = ({ isOpen, onClose, classes }: ClassComparisonModalProps) => {
  if (!isOpen || classes.length !== 2) return null;

  const [classA, classB] = classes;

  const ComparisonRow = ({ label, valueA, valueB, icon: Icon, type = 'text' }: { 
    label: string; 
    valueA: any; 
    valueB: any; 
    icon?: any;
    type?: 'text' | 'rating' | 'list' 
  }) => (
    <div className="grid grid-cols-12 gap-4 py-4 border-b border-gold/10 items-center">
      <div className="col-span-12 md:col-span-2 flex items-center gap-2 text-[10px] uppercase text-gold/40 font-bold tracking-widest">
        {Icon && <Icon size={12} />}
        {label}
      </div>
      <div className="col-span-6 md:col-span-5 text-center">
        {type === 'rating' ? (
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} size={12} className={star <= valueA ? 'text-gold fill-gold' : 'text-gold/10'} />
            ))}
          </div>
        ) : type === 'list' ? (
          <div className="flex flex-wrap justify-center gap-1">
            {valueA.map((item: string, i: number) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-gold/10 rounded-sm text-gold/60">{item}</span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-mythos-text">{valueA}</span>
        )}
      </div>
      <div className="col-span-6 md:col-span-5 text-center">
        {type === 'rating' ? (
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} size={12} className={star <= valueB ? 'text-gold fill-gold' : 'text-gold/10'} />
            ))}
          </div>
        ) : type === 'list' ? (
          <div className="flex flex-wrap justify-center gap-1">
            {valueB.map((item: string, i: number) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-gold/10 rounded-sm text-gold/60">{item}</span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-mythos-text">{valueB}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col glass-card border-2 border-gold animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gold/20 flex justify-between items-center bg-gold/5">
          <h3 className="text-2xl font-cinzel text-gold-gradient">Comparação de Caminhos</h3>
          <button onClick={onClose} className="p-2 hover:bg-gold/10 rounded-full text-gold/60 hover:text-gold transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          {/* Class Names */}
          <div className="grid grid-cols-12 gap-4 pb-8 border-b-2 border-gold/20">
            <div className="col-span-2 hidden md:block" />
            <div className="col-span-6 md:col-span-5 text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <Sword size={32} />
              </div>
              <h4 className="text-3xl font-cinzel text-gold">{classA.name}</h4>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold/40">{classA.category}</span>
            </div>
            <div className="col-span-6 md:col-span-5 text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <Wand2 size={32} />
              </div>
              <h4 className="text-3xl font-cinzel text-gold">{classB.name}</h4>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold/40">{classB.category}</span>
            </div>
          </div>

          {/* Stats Comparison */}
          <div className="space-y-2">
            <h5 className="text-xs font-cinzel text-gold/60 uppercase tracking-widest mb-4">Estatísticas e Papel</h5>
            <ComparisonRow label="Função" valueA={classA.role} valueB={classB.role} icon={Star} />
            <ComparisonRow label="Dificuldade" valueA={classA.difficulty} valueB={classB.difficulty} icon={Zap} />
            <ComparisonRow label="Atributos" valueA={classA.primaryAttributes} valueB={classB.primaryAttributes} icon={Shield} type="list" />
            <ComparisonRow label="PV Base" valueA={(T20_CLASSES as any)[classA.id]?.pvBase} valueB={(T20_CLASSES as any)[classB.id]?.pvBase} icon={Heart} />
            <ComparisonRow label="PV / Nível" valueA={(T20_CLASSES as any)[classA.id]?.pvPerLevel} valueB={(T20_CLASSES as any)[classB.id]?.pvPerLevel} icon={Heart} />
            <ComparisonRow label="PM Base" valueA={(T20_CLASSES as any)[classA.id]?.pmBase} valueB={(T20_CLASSES as any)[classB.id]?.pmBase} icon={Zap} />
            <ComparisonRow label="PM / Nível" valueA={(T20_CLASSES as any)[classA.id]?.pmPerLevel} valueB={(T20_CLASSES as any)[classB.id]?.pmPerLevel} icon={Zap} />
          </div>

          {/* Playstyle Comparison */}
          <div className="space-y-2">
            <h5 className="text-xs font-cinzel text-gold/60 uppercase tracking-widest mb-4">Estilo de Jogo</h5>
            <ComparisonRow label="Dano" valueA={classA.playstyle.dano} valueB={classB.playstyle.dano} icon={Sword} type="rating" />
            <ComparisonRow label="Resistência" valueA={classA.playstyle.resistencia} valueB={classB.playstyle.resistencia} icon={Shield} type="rating" />
            <ComparisonRow label="Suporte" valueA={classA.playstyle.suporte} valueB={classB.playstyle.suporte} icon={Heart} type="rating" />
            <ComparisonRow label="Magia" valueA={classA.playstyle.magia} valueB={classB.playstyle.magia} icon={Zap} type="rating" />
            <ComparisonRow label="Perícias" valueA={classA.playstyle.pericias} valueB={classB.playstyle.pericias} icon={ScrollText} type="rating" />
            <ComparisonRow label="Complexidade" valueA={classA.playstyle.complexidade} valueB={classB.playstyle.complexidade} icon={Zap} type="rating" />
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            <div className="space-y-4">
              <h5 className="text-xs font-cinzel text-success uppercase tracking-widest">Pontos Fortes</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] text-gold/40 uppercase font-bold">{classA.name}</p>
                  <ul className="space-y-1">
                    {classA.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-mythos-text/70 flex items-start gap-2">
                        <span className="text-success mt-1">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-gold/40 uppercase font-bold">{classB.name}</p>
                  <ul className="space-y-1">
                    {classB.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-mythos-text/70 flex items-start gap-2">
                        <span className="text-success mt-1">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="text-xs font-cinzel text-health uppercase tracking-widest">Fraquezas</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] text-gold/40 uppercase font-bold">{classA.name}</p>
                  <ul className="space-y-1">
                    {classA.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs text-mythos-text/70 flex items-start gap-2">
                        <span className="text-health mt-1">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-gold/40 uppercase font-bold">{classB.name}</p>
                  <ul className="space-y-1">
                    {classB.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs text-mythos-text/70 flex items-start gap-2">
                        <span className="text-health mt-1">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gold/20 bg-gold/5 flex justify-end">
          <Button onClick={onClose}>Fechar Comparação</Button>
        </div>
      </div>
    </div>
  );
};
