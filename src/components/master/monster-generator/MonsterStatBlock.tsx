
import React from 'react';
import { Shield, Heart, Sword, Zap, Target, Wind, Eye, MapPin, Sparkles } from 'lucide-react';
import { GeneratedMonster } from '../../../services/monsterGeneratorService';

interface StatItemProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  className?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, icon: Icon, className = "" }) => (
  <div className={`flex flex-col items-center justify-center p-3 rounded-sm bg-black/40 border border-gold/10 ${className}`}>
    <div className="flex items-center gap-1.5 mb-1">
      {Icon && <Icon size={12} className="text-gold/40" />}
      <span className="text-[9px] uppercase font-black text-gold/30 tracking-widest">{label}</span>
    </div>
    <span className="text-xl font-cinzel font-bold text-gold">{value}</span>
  </div>
);

export const MonsterStatBlock: React.FC<{ monster: GeneratedMonster }> = ({ monster }) => {
  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatItem label="Defesa" value={monster.defense} icon={Shield} className="border-gold/20" />
        <StatItem label="PV" value={monster.hp} icon={Heart} className="border-red-900/40" />
        <StatItem label="Ataque" value={`+${monster.attack}`} icon={Sword} className="border-blue-900/40" />
        <StatItem label="CD" value={monster.saveDC} icon={Zap} className="border-purple-900/40" />
      </div>

      {/* Attributes */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <div className="flex flex-col items-center p-2 rounded-sm bg-gold/5 border border-gold/5">
          <span className="text-[8px] uppercase font-bold text-gold/30">FOR</span>
          <span className="text-sm font-bold text-gold">{monster.attributes.str}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-sm bg-gold/5 border border-gold/5">
          <span className="text-[8px] uppercase font-bold text-gold/30">DES</span>
          <span className="text-sm font-bold text-gold">{monster.attributes.dex}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-sm bg-gold/5 border border-gold/5">
          <span className="text-[8px] uppercase font-bold text-gold/30">CON</span>
          <span className="text-sm font-bold text-gold">{monster.attributes.con}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-sm bg-gold/5 border border-gold/5">
          <span className="text-[8px] uppercase font-bold text-gold/30">INT</span>
          <span className="text-sm font-bold text-gold">{monster.attributes.int}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-sm bg-gold/5 border border-gold/5">
          <span className="text-[8px] uppercase font-bold text-gold/30">SAB</span>
          <span className="text-sm font-bold text-gold">{monster.attributes.wis}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-sm bg-gold/5 border border-gold/5">
          <span className="text-[8px] uppercase font-bold text-gold/30">CAR</span>
          <span className="text-sm font-bold text-gold">{monster.attributes.cha}</span>
        </div>
      </div>

      {/* Resistances */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center justify-between p-2 px-3 rounded-sm bg-black/20 border border-gold/5">
          <span className="text-[9px] uppercase font-bold text-gold/40">Fortitude</span>
          <span className="text-sm font-bold text-gold">+{monster.fortitude}</span>
        </div>
        <div className="flex items-center justify-between p-2 px-3 rounded-sm bg-black/20 border border-gold/5">
          <span className="text-[9px] uppercase font-bold text-gold/40">Reflexos</span>
          <span className="text-sm font-bold text-gold">+{monster.reflexes}</span>
        </div>
        <div className="flex items-center justify-between p-2 px-3 rounded-sm bg-black/20 border border-gold/5">
          <span className="text-[9px] uppercase font-bold text-gold/40">Vontade</span>
          <span className="text-sm font-bold text-gold">+{monster.will}</span>
        </div>
      </div>

      {/* Movement & Senses */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2 text-gold/60">
          <Wind size={14} className="text-gold/30" />
          <span className="uppercase font-black text-[9px] tracking-widest">Deslocamento:</span>
          <span className="font-bold text-gold">{monster.speed}</span>
        </div>
        <div className="flex items-center gap-2 text-gold/60">
          <Eye size={14} className="text-gold/30" />
          <span className="uppercase font-black text-[9px] tracking-widest">Sentidos:</span>
          <span className="font-bold text-gold">{monster.senses}</span>
        </div>
      </div>
    </div>
  );
};
