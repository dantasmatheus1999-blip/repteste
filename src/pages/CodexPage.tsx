import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Map, 
  Sun, 
  Flame, 
  Wand2, 
  Library,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface CodexCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  path: string;
  color: string;
}

const categories: CodexCategory[] = [
  {
    id: 'classes',
    title: 'Classes',
    description: 'As especializações e caminhos de poder dos heróis de Arton.',
    icon: Shield,
    path: '/codex/classes',
    color: 'from-amber-500/20 to-yellow-600/20'
  },
  {
    id: 'racas',
    title: 'Raças',
    description: 'As diversas linhagens e povos que habitam o mundo de Tormenta.',
    icon: Users,
    path: '/codex/racas',
    color: 'from-emerald-500/20 to-teal-600/20'
  },
  {
    id: 'origens',
    title: 'Origens',
    description: 'O passado e a história que moldaram quem seu herói é hoje.',
    icon: Map,
    path: '/codex/origens',
    color: 'from-blue-500/20 to-indigo-600/20'
  },
  {
    id: 'divindades',
    title: 'Divindades',
    description: 'O Panteão de Arton e as bênçãos (ou maldições) dos deuses.',
    icon: Sun,
    path: '/codex/divindades',
    color: 'from-orange-500/20 to-red-600/20'
  },
  {
    id: 'poderes',
    title: 'Poderes',
    description: 'Habilidades gerais e técnicas de combate para todos os heróis.',
    icon: Flame,
    path: '/codex/poderes',
    color: 'from-purple-500/20 to-pink-600/20'
  },
  {
    id: 'magias',
    title: 'Magias',
    description: 'Círculos arcanos e divinos para dobrar a realidade à sua vontade.',
    icon: Wand2,
    path: '/codex/magias',
    color: 'from-cyan-500/20 to-blue-600/20'
  }
];

const CornerOrnament = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const posClasses = {
    tl: 'top-0 left-0 border-t border-l',
    tr: 'top-0 right-0 border-t border-r',
    bl: 'bottom-0 left-0 border-b border-l',
    br: 'bottom-0 right-0 border-b border-r'
  };

  return (
    <div className={`absolute w-3 h-3 border-gold/40 ${posClasses[position]} pointer-events-none z-10`} />
  );
};

export const CodexPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 sm:px-0">
      {/* Header */}
      <div className="text-center space-y-4 relative py-6 sm:py-10">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Library size={200} className="sm:w-[300px] sm:h-[300px] text-gold" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
            <div className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent to-gold/50" />
            <Library className="text-gold sm:w-8 sm:h-8" size={24} />
            <div className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-cinzel text-gold-gradient drop-shadow-2xl tracking-widest">CODEX</h1>
          <p className="text-gold/60 text-xs sm:text-sm font-medium italic tracking-wide max-w-lg mx-auto mt-2 sm:mt-4">
            “Conhecimento, poderes e mistérios de Arton reunidos no Grande Grimório.”
          </p>
        </div>
      </div>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => navigate(category.path)}
            className="group relative bg-mythos-card border border-gold/20 p-6 sm:p-8 text-left transition-all hover:border-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] overflow-hidden active:scale-95"
          >
            {/* Background Pattern */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20" />
            
            {/* Ornaments */}
            <CornerOrnament position="tl" />
            <CornerOrnament position="tr" />
            <CornerOrnament position="bl" />
            <CornerOrnament position="br" />

            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-sm bg-black/40 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-110 group-hover:border-gold transition-all duration-300 shadow-inner">
                <category.icon className="sm:w-8 sm:h-8" size={24} strokeWidth={1.5} />
              </div>
              
              <div>
                <h3 className="text-xl sm:text-2xl font-cinzel text-gold group-hover:text-yellow-200 transition-colors flex items-center gap-2">
                  {category.title}
                  <ChevronRight className="sm:w-[18px] sm:h-[18px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" size={16} />
                </h3>
                <p className="text-gold/40 text-xs sm:text-sm mt-2 leading-relaxed group-hover:text-gold/60 transition-colors">
                  {category.description}
                </p>
              </div>

              <div className="pt-2 sm:pt-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-gold/10 group-hover:bg-gold/30 transition-colors" />
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] sm:tracking-[0.3em] text-gold/20 group-hover:text-gold/50 transition-colors">Explorar</span>
                <div className="h-px w-4 bg-gold/10 group-hover:bg-gold/30 transition-colors" />
              </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 sm:w-32 sm:h-32 bg-gold/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      {/* Footer / Quote */}
      <div className="pt-10 text-center">
        <div className="inline-block relative px-10 py-6">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          <p className="text-gold/30 text-xs font-cinzel italic tracking-widest">
            "Aquele que detém o conhecimento, detém o destino de Arton."
          </p>
        </div>
      </div>
    </div>
  );
};
