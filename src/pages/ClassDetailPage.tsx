import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
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
  Gem,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Flame,
  Target,
  Dices,
  Info
} from 'lucide-react';
import { T20_CLASSES_DETAILED } from '../data/t20ClassesDetailed';
import { Button } from '../components/Button';

const iconMap: Record<string, any> = {
  Sword, Wand2, Zap, Heart, Shield, Users, Star, Skull, Backpack, ScrollText, Crown, Anchor, Compass, Gem, ArrowUpDown, Flame, Target, Dices, Info
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

export const ClassDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: true,
    playstyle: true,
    attributes: true,
    abilities: true,
    progression: false,
    resources: false,
    builds: true
  });

  const classData = useMemo(() => {
    return T20_CLASSES_DETAILED.find(c => c.slug === slug);
  }, [slug]);

  if (!classData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <h2 className="text-4xl font-cinzel text-gold-gradient">Classe não encontrada</h2>
        <Button onClick={() => navigate('/codex/classes')}>Voltar para Lista</Button>
      </div>
    );
  }

  const Icon = iconMap[classData.iconName] || Sword;

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const SectionHeader = ({ title, id, icon: SectionIcon }: { title: string, id: string, icon: any }) => (
    <button 
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-6 bg-black/20 border-b border-gold/10 hover:bg-gold/5 transition-all group relative"
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-2 rounded-sm bg-gold/5 text-gold border border-gold/20 group-hover:border-gold/50 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all">
          <SectionIcon size={20} />
        </div>
        <h3 className="text-2xl font-cinzel text-gold tracking-[0.2em] uppercase drop-shadow-md group-hover:brightness-125 transition-all">{title}</h3>
      </div>
      <div className="w-8 h-8 rounded-full border border-gold/10 flex items-center justify-center group-hover:border-gold/40 transition-all relative z-10">
        {openSections[id] ? <ChevronUp size={18} className="text-gold/40" /> : <ChevronDown size={18} className="text-gold/40" />}
      </div>
      <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent transition-all duration-500" />
    </button>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* Back Button */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/codex/classes')}
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
        
        {/* Background Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-5 -rotate-12 scale-100 sm:scale-150 pointer-events-none">
          <Icon size={200} className="sm:w-[300px] sm:h-[300px]" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 sm:gap-12 items-center md:items-start">
          <div className="relative group">
            <div className="absolute inset-0 bg-gold/30 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-sm bg-black/60 border-2 border-gold flex items-center justify-center text-gold shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 medieval-border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-transparent to-transparent" />
              <Icon size={60} className="sm:w-20 sm:h-20 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
              <CornerOrnament size="w-4 h-4" opacity="opacity-60" />
            </div>
          </div>
          <div className="text-center md:text-left space-y-4 sm:space-y-6 flex-1">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-cinzel text-gold-gradient leading-none drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] break-words">{classData.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="h-px w-4 sm:w-8 bg-gold/40" />
                <p className="text-gold/60 uppercase font-bold tracking-[0.2em] sm:tracking-[0.5em] text-[10px] sm:text-sm">{classData.role}</p>
                <div className="h-px w-4 sm:w-8 bg-gold/40" />
              </div>
            </div>
            <p className="text-base sm:text-xl text-mythos-text/90 italic max-w-3xl leading-relaxed font-medium">
              "{classData.concept}"
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start pt-4">
              {classData.tags.map(tag => (
                <span key={tag} className="px-3 sm:px-4 py-1 sm:py-1.5 bg-black/40 border border-gold/20 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-gold/80 hover:border-gold hover:bg-gold/10 transition-all cursor-default shadow-sm hover:shadow-gold/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DecorativeDivider />

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Overview Section */}
          <div className="glass-card overflow-hidden border-2 border-gold/10 rounded-lg shadow-inner relative">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <SectionHeader title="Visão Geral" id="overview" icon={Info} />
            {openSections.overview && (
              <div className="p-10 space-y-8 animate-in slide-in-from-top-4 duration-500 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                <p className="text-mythos-text/90 leading-relaxed font-medium text-lg italic">
                  {classData.summary}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-gold/10">
                  <div className="space-y-6">
                    <h4 className="text-lg font-cinzel text-success uppercase tracking-[0.2em] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center border border-success/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        <Star size={16} />
                      </div>
                      Virtudes
                    </h4>
                    <ul className="space-y-4">
                      {classData.strengths.map((s, i) => (
                        <li key={i} className="text-mythos-muted flex gap-4 items-start group">
                          <span className="text-success font-bold mt-1 group-hover:scale-150 group-hover:rotate-12 transition-all">✦</span> 
                          <span className="text-sm leading-relaxed group-hover:text-mythos-text transition-colors">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-lg font-cinzel text-health uppercase tracking-[0.2em] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-health/10 flex items-center justify-center border border-health/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        <Skull size={16} />
                      </div>
                      Limitações
                    </h4>
                    <ul className="space-y-4">
                      {classData.weaknesses.map((w, i) => (
                        <li key={i} className="text-mythos-muted flex gap-4 items-start group">
                          <span className="text-health font-bold mt-1 group-hover:scale-150 group-hover:-rotate-12 transition-all">✦</span> 
                          <span className="text-sm leading-relaxed group-hover:text-mythos-text transition-colors">{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DecorativeDivider />

          {/* Resources Section */}
          <div className="glass-card overflow-hidden border-2 border-gold/10 rounded-lg relative">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <SectionHeader title="Recursos e Estilo" id="resources" icon={Backpack} />
            {openSections.resources && (
              <div className="p-10 space-y-8 animate-in slide-in-from-top-4 duration-500 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-black/40 border border-gold/10 rounded-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Zap size={40} />
                    </div>
                    <h5 className="text-gold/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Mana e Energia</h5>
                    <p className="text-sm text-mythos-text/70 italic leading-relaxed">{classData.resources.mana}</p>
                  </div>
                  <div className="p-6 bg-black/40 border border-gold/10 rounded-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Sword size={40} />
                    </div>
                    <h5 className="text-gold/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Combate</h5>
                    <p className="text-sm text-mythos-text/70 italic leading-relaxed">{classData.resources.combat}</p>
                  </div>
                  <div className="p-6 bg-black/40 border border-gold/10 rounded-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ScrollText size={40} />
                    </div>
                    <h5 className="text-gold/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Perícias</h5>
                    <p className="text-sm text-mythos-text/70 italic leading-relaxed">{classData.resources.skills}</p>
                  </div>
                  <div className="p-6 bg-black/40 border border-gold/10 rounded-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Backpack size={40} />
                    </div>
                    <h5 className="text-gold/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Utilidade</h5>
                    <p className="text-sm text-mythos-text/70 italic leading-relaxed">{classData.resources.utility}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DecorativeDivider />

          {/* Progression Section */}
          <div className="glass-card overflow-hidden border-2 border-gold/10 rounded-lg relative">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <SectionHeader title="Progressão de Nível" id="progression" icon={ArrowUpDown} />
            {openSections.progression && (
              <div className="p-10 animate-in slide-in-from-top-4 duration-500 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                <div className="space-y-6 relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold/40 via-gold/10 to-transparent" />
                  {classData.progression.map((p, i) => (
                    <div key={i} className="flex items-center gap-8 relative z-10 group">
                      <div className="w-8 h-8 rounded-full bg-mythos-bg border-2 border-gold flex items-center justify-center text-[10px] font-bold text-gold shadow-[0_0_10px_rgba(212,175,55,0.3)] group-hover:scale-110 transition-transform">
                        {p.level}
                      </div>
                      <div className="flex-1 p-4 bg-gold/5 border border-gold/10 rounded-sm group-hover:border-gold/30 transition-all">
                        <p className="text-sm text-gold font-cinzel group-hover:brightness-125 transition-all">{p.gain}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DecorativeDivider />

          {/* Abilities Section */}
          <div className="glass-card overflow-hidden border-2 border-gold/10 rounded-lg relative">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <SectionHeader title="Habilidades de Classe" id="abilities" icon={ScrollText} />
            {openSections.abilities && (
              <div className="p-10 space-y-8 animate-in slide-in-from-top-4 duration-500 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                <div className="grid gap-6">
                  {classData.abilities.map((ability, i) => (
                    <div key={i} className="p-6 bg-black/40 border border-gold/10 rounded-sm relative group overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gold/20 group-hover:bg-gold transition-all" />
                      <div className="absolute top-0 right-0 px-3 py-1 bg-gold/10 text-[9px] font-bold text-gold uppercase tracking-widest border-b border-l border-gold/20">
                        Nível {ability.level}
                      </div>
                      <h4 className="text-lg font-cinzel text-gold mb-2 group-hover:brightness-125 transition-all">{ability.name}</h4>
                      <p className="text-sm text-mythos-text/60 italic leading-relaxed">{ability.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DecorativeDivider />

          {/* Builds Section */}
          <div className="glass-card overflow-hidden border-2 border-gold/10 rounded-lg relative">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <SectionHeader title="Estilos de Build" id="builds" icon={Flame} />
            {openSections.builds && (
              <div className="p-10 space-y-8 animate-in slide-in-from-top-4 duration-500 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {classData.builds.map((build, i) => (
                    <div key={i} className="p-8 bg-gold/5 border border-gold/20 rounded-sm space-y-4 hover:border-gold/50 transition-all group relative overflow-hidden">
                      <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Flame size={80} />
                      </div>
                      <h4 className="text-2xl font-cinzel text-gold-gradient group-hover:brightness-125 transition-all">{build.name}</h4>
                      <p className="text-sm text-mythos-text/70 italic leading-relaxed">{build.description}</p>
                      <div className="flex flex-wrap gap-2 pt-4">
                        {build.focus.map(f => (
                          <span key={f} className="text-[9px] px-3 py-1 bg-black/60 text-gold/60 border border-gold/20 rounded-full uppercase font-bold tracking-wider group-hover:border-gold/40 transition-all">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column - Stats & Recommendations */}
        <div className="space-y-8">
          
          {/* Playstyle Stats */}
          <div className="glass-card p-10 border-2 border-gold/20 space-y-10 rounded-lg relative overflow-hidden group">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <h3 className="text-2xl font-cinzel text-gold tracking-[0.2em] uppercase border-b border-gold/10 pb-6 text-center relative z-10">Estatísticas</h3>
            <div className="space-y-8 relative z-10">
              {(Object.entries(classData.playstyle) as [string, number][]).map(([key, val]) => (
                <div key={key} className="space-y-3 group/stat">
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-[0.3em] group-hover/stat:text-gold transition-colors">
                    <span className="text-gold/40">{key}</span>
                    <span className="text-gold drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">{val}/5</span>
                  </div>
                  <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-gold/20 p-[1px] shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-gold-aged via-gold to-yellow-200 shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-1000 rounded-full" 
                      style={{ width: `${(val / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attributes Section */}
          <div className="glass-card p-8 border-2 border-gold/20 space-y-6 rounded-lg relative overflow-hidden group">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <h3 className="text-xl font-cinzel text-gold tracking-widest uppercase border-b border-gold/10 pb-4 relative z-10">Atributos</h3>
            <div className="space-y-8 relative z-10">
              <div className="space-y-4">
                <p className="text-[10px] uppercase text-gold/40 font-bold tracking-widest text-center">Prioridade Máxima</p>
                <div className="flex justify-center gap-4">
                  {classData.primaryAttributes.map(attr => (
                    <div key={attr} className="w-16 h-16 rounded-sm bg-gold text-mythos-bg flex items-center justify-center font-medieval text-2xl font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 transition-transform cursor-default relative overflow-hidden group/attr">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                      {attr}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] uppercase text-gold/40 font-bold tracking-widest text-center">Secundários</p>
                <div className="flex justify-center gap-3">
                  {classData.secondaryAttributes.map(attr => (
                    <div key={attr} className="w-12 h-12 rounded-sm bg-gold/10 border-2 border-gold/30 text-gold flex items-center justify-center font-medieval text-lg font-bold hover:bg-gold/20 transition-all cursor-default">
                      {attr}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Section */}
          <div className="glass-card p-8 border-2 border-gold/20 text-center space-y-6 rounded-lg relative overflow-hidden group">
            <CornerOrnament size="w-4 h-4" opacity="opacity-20" />
            <div className="space-y-2">
              <p className="text-[10px] uppercase text-gold/40 font-bold tracking-widest">Indicado para</p>
              <div className={`text-3xl font-cinzel uppercase tracking-[0.2em] drop-shadow-md ${
                classData.recommendedFor === 'iniciante' ? 'text-success' : 
                classData.recommendedFor === 'intermediario' ? 'text-gold' : 'text-health'
              }`}>
                {classData.recommendedFor}
              </div>
            </div>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto" />
            <Button 
              className="w-full shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]" 
              onClick={() => navigate('/characters', { state: { selectedClass: classData.id } })}
            >
              Escolher esta Classe
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
};
