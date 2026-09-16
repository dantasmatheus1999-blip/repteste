import React from 'react';
import { T20ClassDetail } from '../../types/classes';
import { 
  Sword, 
  Wand2, 
  Zap, 
  Heart, 
  Shield, 
  Users, 
  ChevronRight,
  Star,
  Skull,
  Backpack,
  ScrollText,
  Crown,
  Anchor,
  Compass,
  Gem
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Sword,
  Wand2,
  Zap,
  Heart,
  Shield,
  Users,
  Star,
  Skull,
  Backpack,
  ScrollText,
  Crown,
  Anchor,
  Compass,
  Gem
};

interface ClassCardProps {
  classData: T20ClassDetail;
  onClick: () => void;
}

const CornerOrnament = () => (
  <>
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold/30 rounded-tl-sm pointer-events-none z-20" />
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gold/30 rounded-tr-sm pointer-events-none z-20" />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gold/30 rounded-bl-sm pointer-events-none z-20" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold/30 rounded-br-sm pointer-events-none z-20" />
  </>
);

const DecorativeDivider = () => (
  <div className="flex items-center gap-2 w-full my-4 opacity-30">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold" />
    <div className="w-1.5 h-1.5 rotate-45 border border-gold" />
    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold" />
  </div>
);

export const ClassCard: React.FC<ClassCardProps> = ({ classData, onClick }) => {
  const Icon = iconMap[classData.iconName] || Sword;

  const difficultyColors = {
    iniciante: 'text-success border-success/30 bg-success/5',
    intermediario: 'text-gold border-gold/30 bg-gold/5',
    avancado: 'text-health border-health/30 bg-health/5'
  };

  const categoryLabels = {
    combatente: 'Combatente',
    conjurador: 'Conjurador',
    especialista: 'Especialista',
    suporte: 'Suporte',
    hibrido: 'Híbrido'
  };

  const categoryIcons: Record<string, any> = {
    combatente: Sword,
    conjurador: Wand2,
    especialista: Zap,
    suporte: Heart,
    hibrido: Shield
  };

  const CategoryIcon = categoryIcons[classData.category] || Sword;

  return (
    <div 
      onClick={onClick}
      className="glass-card p-6 border-2 border-gold/10 hover:border-gold/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full medieval-border"
    >
      <CornerOrnament />
      
      {/* Background Texture & Decoration */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20 pointer-events-none" />
      <div className="absolute -top-6 -right-6 opacity-5 group-hover:opacity-20 transition-all duration-700 rotate-12 group-hover:rotate-0 group-hover:scale-110">
        <Icon size={140} />
      </div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3 rounded-sm border-2 transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] ${
          classData.category === 'conjurador' ? 'bg-magic/10 border-magic/40 text-magic' :
          classData.category === 'combatente' ? 'bg-health/10 border-health/40 text-health' :
          'bg-gold/10 border-gold/40 text-gold'
        }`}>
          <CategoryIcon size={24} />
        </div>
        <div className={`px-3 py-1 rounded-sm border-2 text-[10px] font-bold uppercase tracking-widest shadow-lg ${difficultyColors[classData.difficulty]}`}>
          {classData.difficulty}
        </div>
      </div>

      <div className="mb-4 relative z-10">
        <h3 className="text-3xl font-cinzel text-gold-gradient group-hover:brightness-125 transition-all drop-shadow-md">{classData.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-px w-4 bg-gold/30" />
          <p className="text-[9px] text-gold/50 uppercase font-bold tracking-[0.3em]">{categoryLabels[classData.category]}</p>
        </div>
      </div>

      <p className="text-sm text-mythos-muted mb-4 flex-1 line-clamp-3 italic leading-relaxed relative z-10">
        "{classData.summary}"
      </p>

      <DecorativeDivider />

      <div className="space-y-4 mb-6 relative z-10">
        <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-[0.2em]">
          <span className="text-gold/40">Atributo Foco</span>
          <span className="text-gold-gradient">{classData.primaryAttributes.join(' • ')}</span>
        </div>
        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-gold/10 p-[1px]">
          <div 
            className="h-full bg-gradient-to-r from-gold-aged via-gold to-yellow-200 transition-all duration-1000 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
            style={{ width: `${(classData.playstyle.complexidade / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-gold/10 relative z-10">
        <span className="text-[10px] text-gold/40 uppercase font-bold tracking-[0.2em] group-hover:text-gold transition-colors">Abrir Grimório</span>
        <div className="w-8 h-8 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 group-hover:border-gold transition-all shadow-[0_0_10px_rgba(212,175,55,0)] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          <ChevronRight size={16} className="text-gold group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
