import React from 'react';
import { T20OriginDetail } from '../../types/origins';
import { 
  Sun, 
  Hammer, 
  Music, 
  FlaskConical, 
  Compass, 
  Sprout, 
  Theater, 
  Skull, 
  HeartPulse, 
  Mountain, 
  BookOpen, 
  Swords, 
  Shield, 
  Crown, 
  Anchor, 
  Coins, 
  Pickaxe, 
  Map, 
  Trees, 
  Sword,
  ChevronRight,
  PawPrint,
  HelpCircle,
  Gem,
  Grip,
  Tent,
  Link,
  Globe,
  Star,
  Ship,
  Axe,
  Key,
  Baby,
  Footprints,
  UserPlus,
  Beer,
  Briefcase,
  Sparkles
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Sun, Hammer, Music, FlaskConical, Compass, Sprout, Theater, Skull, HeartPulse, Mountain, BookOpen, Swords, Shield, Crown, Anchor, Coins, Pickaxe, Map, Trees, Sword,
  PawPrint, HelpCircle, Gem, Grip, Tent, Link, Globe, Star, Ship, Axe, Key, Baby, Footprints, UserPlus, Beer, Briefcase, Sparkles
};

interface OriginCardProps {
  origin: T20OriginDetail;
  onClick: () => void;
}

export const OriginCard: React.FC<OriginCardProps> = ({ origin, onClick }) => {
  const Icon = iconMap[origin.iconName] || Compass;

  return (
    <button
      onClick={onClick}
      className="group relative bg-mythos-card border border-gold/20 p-6 text-left transition-all hover:border-gold hover:shadow-[0_0_25px_rgba(212,175,55,0.1)] overflow-hidden active:scale-95 w-full"
    >
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-10" />
      
      {/* Corner Ornaments */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold/30 group-hover:border-gold transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gold/30 group-hover:border-gold transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gold/30 group-hover:border-gold transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold/30 group-hover:border-gold transition-colors" />

      <div className="relative z-10 flex gap-5">
        <div className="w-16 h-16 shrink-0 rounded-sm bg-black/40 border border-gold/20 flex items-center justify-center text-gold group-hover:scale-110 group-hover:border-gold/50 transition-all duration-500 shadow-inner">
          <Icon size={32} strokeWidth={1.5} />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-cinzel text-gold group-hover:text-yellow-200 transition-colors">
              {origin.name}
            </h3>
            <ChevronRight size={16} className="text-gold/20 group-hover:text-gold group-hover:translate-x-1 transition-all" />
          </div>
          
          <p className="text-gold/40 text-xs italic line-clamp-2 leading-relaxed">
            {origin.summary}
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            {origin.skills.slice(0, 2).map((skill, i) => (
              <span key={i} className="text-[9px] px-2 py-0.5 bg-gold/5 border border-gold/10 text-gold/60 rounded-sm font-bold uppercase tracking-wider">
                {skill}
              </span>
            ))}
            {origin.skills.length > 2 && (
              <span className="text-[9px] px-2 py-0.5 bg-gold/5 border border-gold/10 text-gold/60 rounded-sm font-bold uppercase tracking-wider">
                ...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover Glow */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gold/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};
