import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Mountain, 
  Trees, 
  Ghost, 
  Skull, 
  Shield, 
  Zap, 
  Gem, 
  Flame, 
  Waves, 
  Moon, 
  Sun, 
  Star,
  Info,
  Swords,
  Sparkles
} from 'lucide-react';
import { T20_RACES } from '../data/t20Races';
import { Button } from '../components/Button';

const iconMap: Record<string, any> = {
  Users, Mountain, Trees, Ghost, Skull, Shield, Zap, Gem, Flame, Waves, Moon, Sun, Star
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

export const RaceDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const race = useMemo(() => {
    return T20_RACES.find(r => r.slug === slug);
  }, [slug]);

  if (!race) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <h2 className="text-4xl font-cinzel text-gold-gradient">Raça não encontrada</h2>
        <Button onClick={() => navigate('/codex/racas')}>Voltar para Lista</Button>
      </div>
    );
  }

  const Icon = iconMap[race.iconName] || Users;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* Back Button */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/codex/racas')}
          className="flex items-center gap-3 text-gold/60 hover:text-gold transition-all font-cinzel uppercase text-xs tracking-[0.3em] group"
        >
          <div className="w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center group-hover:border-gold transition-all">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          Voltar ao Codex
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
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-sm bg-black/60 border-2 border-gold flex items-center justify-center text-gold shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 medieval-border overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-transparent to-transparent" />
            <Icon size={60} className="sm:w-20 sm:h-20 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
            <CornerOrnament size="w-4 h-4" opacity="opacity-60" />
          </div>
          
          <div className="text-center md:text-left space-y-4 flex-1">
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-cinzel text-gold-gradient leading-none drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] break-words">{race.name}</h1>
              <p className="text-gold/60 uppercase font-bold tracking-[0.2em] sm:tracking-[0.5em] text-[10px] sm:text-sm">{race.system} • {race.edition}</p>
            </div>
            <p className="text-base sm:text-xl text-mythos-text/90 italic max-w-3xl leading-relaxed font-medium">
              "{race.description}"
            </p>
          </div>
        </div>
      </div>

      <DecorativeDivider />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Tech Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Attribute Modifiers */}
          <div className="glass-card p-8 border-2 border-gold/10 rounded-lg relative overflow-hidden">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <h3 className="text-2xl font-cinzel text-gold tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
              <div className="p-2 rounded-sm bg-gold/5 border border-gold/20">
                <Zap size={20} />
              </div>
              Modificadores de Atributos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {race.attributeModifiers.map((mod, i) => (
                <div key={i} className="p-4 bg-black/40 border border-gold/10 rounded-sm flex flex-col items-center justify-center space-y-1 group hover:border-gold/30 transition-all">
                  <span className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">{mod.attribute}</span>
                  <span className={`text-3xl font-medieval ${mod.value > 0 ? 'text-success' : mod.value < 0 ? 'text-health' : 'text-gold'}`}>
                    {mod.value > 0 ? `+${mod.value}` : mod.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Racial Abilities */}
          <div className="glass-card border-2 border-gold/10 rounded-lg relative overflow-hidden">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <div className="p-6 bg-black/20 border-b border-gold/10">
              <h3 className="text-2xl font-cinzel text-gold tracking-[0.2em] uppercase flex items-center gap-3">
                <div className="p-2 rounded-sm bg-gold/5 border border-gold/20">
                  <Sparkles size={20} />
                </div>
                Habilidades Raciais
              </h3>
            </div>
            <div className="p-8 space-y-6">
              {race.racialAbilities.map((ability, i) => (
                <div key={i} className="p-6 bg-black/40 border border-gold/10 rounded-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold/20 group-hover:bg-gold transition-all" />
                  <h4 className="text-xl font-cinzel text-gold mb-2 group-hover:brightness-125 transition-all">{ability.name}</h4>
                  <p className="text-sm text-mythos-text/70 leading-relaxed italic">
                    {ability.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column - Strategy */}
        <div className="space-y-8">
          
          {/* Playstyle */}
          <div className="glass-card p-8 border-2 border-gold/20 rounded-lg relative overflow-hidden group">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <h3 className="text-xl font-cinzel text-gold tracking-widest uppercase border-b border-gold/10 pb-4 mb-6">Estilo de Jogo</h3>
            <ul className="space-y-4">
              {race.playstyle.map((p, i) => (
                <li key={i} className="flex gap-3 items-start group/item">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold/40 group-hover/item:bg-gold transition-colors" />
                  <p className="text-sm text-mythos-text/80 italic leading-relaxed">{p}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Synergies */}
          <div className="glass-card p-8 border-2 border-gold/20 rounded-lg relative overflow-hidden group">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <h3 className="text-xl font-cinzel text-gold tracking-widest uppercase border-b border-gold/10 pb-4 mb-6">Sinergias</h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] uppercase text-gold/40 font-bold tracking-widest flex items-center gap-2">
                  <Shield size={12} /> Classes Recomendadas
                </p>
                <div className="flex flex-wrap gap-2">
                  {race.synergies.classes.map(c => (
                    <span key={c} className="px-3 py-1 bg-gold/10 border border-gold/20 rounded-sm text-[10px] font-bold text-gold uppercase tracking-wider">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] uppercase text-gold/40 font-bold tracking-widest flex items-center gap-2">
                  <Swords size={12} /> Builds Comuns
                </p>
                <div className="space-y-2">
                  {race.synergies.builds.map((b, i) => (
                    <p key={i} className="text-xs text-mythos-text/60 italic leading-relaxed border-l border-gold/20 pl-3">
                      {b}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="glass-card p-8 border-2 border-gold/20 text-center rounded-lg relative overflow-hidden">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <Button 
              className="w-full shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
              onClick={() => navigate('/characters/sheet', { state: { selectedRace: race.id } })}
            >
              Escolher esta Raça
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};
