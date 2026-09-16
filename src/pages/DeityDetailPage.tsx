import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Skull, 
  Trees, 
  Swords, 
  Sun, 
  Theater, 
  Flame, 
  Scale, 
  Heart, 
  ShieldCheck, 
  HeartHandshake, 
  Ghost, 
  Dices, 
  Waves, 
  Zap, 
  Book, 
  Moon, 
  Grip, 
  Compass,
  Sparkles,
  ScrollText
} from 'lucide-react';
import { T20_DEITIES } from '../data/t20Deities';
import { T20_POWERS } from '../data/t20Powers';
import { Button } from '../components/Button';

const iconMap: Record<string, any> = {
  Skull, Trees, Swords, Sun, Theater, Flame, Scale, Heart, ShieldCheck, HeartHandshake, Ghost, Dices, Waves, Zap, Book, Moon, Grip, Compass, Sparkles
};

const CornerOrnament = ({ size = "w-6 h-6", opacity = "opacity-30" }: { size?: string, opacity?: string }) => (
  <>
    <div className={`absolute top-0 left-0 ${size} border-t-2 border-l-2 border-gold ${opacity} rounded-tl-sm pointer-events-none z-20`} />
    <div className={`absolute top-0 right-0 ${size} border-t-2 border-r-2 border-gold ${opacity} rounded-tr-sm pointer-events-none z-20`} />
    <div className={`absolute bottom-0 left-0 ${size} border-b-2 border-l-2 border-gold ${opacity} rounded-bl-sm pointer-events-none z-20`} />
    <div className={`absolute bottom-0 right-0 ${size} border-b-2 border-r-2 border-gold ${opacity} rounded-br-sm pointer-events-none z-20`} />
  </>
);

const DecorativeDivider = () => (
  <div className="flex items-center gap-4 w-full my-8 opacity-20">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold to-gold" />
    <div className="flex gap-1">
      <div className="w-2 h-2 rotate-45 border border-gold" />
      <div className="w-2 h-2 rotate-45 bg-gold" />
      <div className="w-2 h-2 rotate-45 border border-gold" />
    </div>
    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gold to-gold" />
  </div>
);

export const DeityDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const deity = useMemo(() => {
    return T20_DEITIES.find(d => d.slug === slug);
  }, [slug]);

  if (!deity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <h2 className="text-4xl font-cinzel text-gold-gradient">Divindade não encontrada</h2>
        <Button onClick={() => navigate('/codex/divindades')}>Voltar para Lista</Button>
      </div>
    );
  }

  const Icon = iconMap[deity.iconName] || Flame;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* Back Button */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/codex/divindades')}
          className="flex items-center gap-3 text-gold/60 hover:text-gold transition-all font-cinzel uppercase text-xs tracking-[0.3em] group"
        >
          <div className="w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center group-hover:border-gold transition-all">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          Voltar ao Panteão
        </button>
        <div className="h-px flex-1 mx-8 bg-gradient-to-r from-gold/20 via-transparent to-transparent hidden md:block" />
      </div>

      {/* Hero Section */}
      <div className="glass-card p-6 sm:p-10 md:p-16 relative overflow-hidden medieval-border rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <CornerOrnament size="w-8 h-8 sm:w-12 sm:h-12" opacity="opacity-40" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-5 -rotate-12 scale-100 sm:scale-150 pointer-events-none">
          <Icon size={200} className="sm:w-[300px] sm:h-[300px]" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 sm:gap-12 items-center md:items-start">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full bg-black/60 border-2 border-gold flex items-center justify-center text-gold shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-transparent to-transparent" />
            <Icon size={60} className="sm:w-20 sm:h-20 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
          </div>
          
          <div className="text-center md:text-left space-y-4 flex-1">
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-cinzel text-gold-gradient leading-none drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] break-words">{deity.name}</h1>
              <p className="text-gold/60 uppercase font-bold tracking-[0.2em] sm:tracking-[0.5em] text-[10px] sm:text-sm">{deity.system} • {deity.edition}</p>
            </div>
            <p className="text-base sm:text-xl text-mythos-text/90 italic max-w-3xl leading-relaxed font-medium">
              "{deity.description}"
            </p>
          </div>
        </div>
      </div>

      <DecorativeDivider />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* 2. Crenças e Objetivos */}
          <div className="glass-card border-2 border-gold/10 rounded-lg relative overflow-hidden">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <div className="p-6 bg-black/20 border-b border-gold/10">
              <h3 className="text-xl font-cinzel text-gold tracking-[0.2em] uppercase flex items-center gap-3">
                Crenças e Objetivos
              </h3>
            </div>
            <div className="p-8">
              <p className="text-mythos-text/90 leading-relaxed italic">
                {deity.beliefsAndGoals}
              </p>
            </div>
          </div>

          {/* 3, 4, 5 - Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card border-2 border-gold/10 rounded-lg p-6 relative overflow-hidden">
              <h4 className="text-xs font-cinzel text-gold/40 uppercase tracking-widest mb-2">Símbolo Sagrado</h4>
              <p className="text-sm text-gold/80">{deity.sacredSymbol}</p>
            </div>
            <div className="glass-card border-2 border-gold/10 rounded-lg p-6 relative overflow-hidden">
              <h4 className="text-xs font-cinzel text-gold/40 uppercase tracking-widest mb-2">Canalizar Energia</h4>
              <p className="text-sm text-gold/80">{deity.channelDivinity}</p>
            </div>
            <div className="glass-card border-2 border-gold/10 rounded-lg p-6 relative overflow-hidden">
              <h4 className="text-xs font-cinzel text-gold/40 uppercase tracking-widest mb-2">Arma Preferida</h4>
              <p className="text-sm text-gold/80">{deity.favoredWeapon}</p>
            </div>
          </div>

          {/* 6. Devotos */}
          <div className="glass-card border-2 border-gold/10 rounded-lg relative overflow-hidden">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <div className="p-6 bg-black/20 border-b border-gold/10">
              <h3 className="text-xl font-cinzel text-gold tracking-[0.2em] uppercase">
                Devotos
              </h3>
            </div>
            <div className="p-8">
              <p className="text-mythos-text/90 leading-relaxed">
                {deity.devotees}
              </p>
            </div>
          </div>

          {/* 7. Obrigações e Restrições */}
          <div className="glass-card border-2 border-gold/10 rounded-lg relative overflow-hidden">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <div className="p-6 bg-black/20 border-b border-gold/10">
              <h3 className="text-xl font-cinzel text-gold tracking-[0.2em] uppercase">
                Obrigações e Restrições
              </h3>
            </div>
            <div className="p-8">
              <ul className="space-y-3">
                {deity.obligationsAndRestrictions.map((item, i) => (
                  <li key={i} className="flex gap-3 text-mythos-text/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 8. Poderes Concedidos */}
          <div className="glass-card border-2 border-gold/10 rounded-lg relative overflow-hidden">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <div className="p-6 bg-black/20 border-b border-gold/10">
              <h3 className="text-2xl font-cinzel text-gold tracking-[0.2em] uppercase flex items-center gap-3">
                <div className="p-2 rounded-sm bg-gold/5 border border-gold/20">
                  <Sparkles size={20} />
                </div>
                Poderes Concedidos
              </h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {deity.grantedPowerIds.map((powerId) => {
                const power = T20_POWERS.find(p => p.id === powerId);
                if (!power) return null;
                
                return (
                  <button 
                    key={powerId} 
                    onClick={() => navigate(`/codex/poderes?poder=${power.slug}&categoria=concedidos`)}
                    className="p-6 bg-black/40 border border-gold/10 rounded-sm relative group overflow-hidden text-left hover:border-gold/40 transition-all"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gold/20 group-hover:bg-gold transition-all" />
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-cinzel text-gold group-hover:brightness-125 transition-all">{power.name}</h4>
                      <Zap size={14} className="text-gold/20 group-hover:text-gold transition-colors" />
                    </div>
                    <p className="text-sm text-mythos-text/70 leading-relaxed italic line-clamp-3">
                      {power.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold/30 group-hover:text-gold/60 transition-colors">
                      <span>Ver detalhes</span>
                      <div className="h-px flex-1 bg-gold/10 group-hover:bg-gold/30" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Quick Info */}
        <div className="space-y-8">
          <div className="glass-card p-8 border-2 border-gold/20 rounded-lg relative overflow-hidden group">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <h3 className="text-xl font-cinzel text-gold tracking-widest uppercase border-b border-gold/10 pb-4 mb-6">Resumo</h3>
            <p className="text-mythos-text/70 italic leading-relaxed">
              {deity.summary}
            </p>
            
            <div className="mt-8 pt-6 border-t border-gold/10 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gold/40 uppercase font-bold tracking-tighter">Sistema</span>
                <span className="text-gold font-cinzel">{deity.system}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gold/40 uppercase font-bold tracking-tighter">Edição</span>
                <span className="text-gold font-cinzel">{deity.edition}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 border-2 border-gold/20 text-center rounded-lg relative overflow-hidden">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <Button 
              className="w-full shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
              onClick={() => navigate('/characters/sheet', { state: { selectedDeity: deity.id } })}
            >
              Devotar-se a {deity.name}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
