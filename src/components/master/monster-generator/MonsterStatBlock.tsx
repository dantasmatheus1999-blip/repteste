
import React from 'react';
import { Shield, Heart, Sword, Zap, Target, Wind, Eye, Sparkles, BookOpen, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { GeneratedMonster } from '../../../services/monsterGeneratorService';

interface StatItemProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  className?: string;
  subtitle?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, icon: Icon, className = "", subtitle }) => (
  <div className={`flex flex-col items-center justify-center p-3 rounded bg-stone-950/80 border ${className}`}>
    <div className="flex items-center gap-1.5 mb-1">
      {Icon && <Icon size={13} className="text-amber-400" />}
      <span className="text-[10px] uppercase font-bold text-amber-200/60 font-cinzel tracking-wider">{label}</span>
    </div>
    <span className="text-xl font-cinzel font-bold text-amber-100">{value}</span>
    {subtitle && <span className="text-[9px] text-stone-400 font-cinzel">{subtitle}</span>}
  </div>
);

export const MonsterStatBlock: React.FC<{ monster: GeneratedMonster }> = ({ monster }) => {
  const combatRoleLabel = monster.combatRole ? monster.combatRole.toUpperCase() : 'SOLO';

  return (
    <div className="space-y-5">
      {/* Badge de Tabela Oficial e Papel de Combate */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-xs">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-amber-400" />
          <span className="font-cinzel text-amber-200 font-bold uppercase tracking-wider">
            {monster.validation?.tableUsed || `Tabela 2-3 (${combatRoleLabel})`} • ND {monster.nd}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {monster.validation?.status === 'OK' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase">
              <CheckCircle2 size={11} />
              100% Conforme T20
            </span>
          )}
          {monster.validation?.status === 'ATENÇÃO' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase">
              <AlertTriangle size={11} />
              Ajuste Conceitual
            </span>
          )}
          {monster.validation?.status === 'FORA DO PADRÃO' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-bold uppercase">
              <AlertOctagon size={11} />
              Fora do Padrão
            </span>
          )}
        </div>
      </div>

      {/* Primary Stats da Tabela 2-3 */}
      <div className={`grid gap-2.5 ${monster.manaPoints !== undefined ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
        <StatItem 
          label="Defesa" 
          value={monster.defense} 
          icon={Shield} 
          className="border-amber-700/40 hover:border-amber-500/60 transition-colors" 
          subtitle={monster.tableReference ? `Base: ${monster.tableReference.defense}` : undefined}
        />
        <StatItem 
          label="Pontos de Vida" 
          value={`${monster.hp} PV`} 
          icon={Heart} 
          className="border-red-800/40 hover:border-red-600/60 transition-colors" 
          subtitle={monster.tableReference ? `Base: ${monster.tableReference.hp}` : undefined}
        />
        {monster.manaPoints !== undefined && (
          <StatItem 
            label="Pontos de Mana" 
            value={`${monster.manaPoints} PM`} 
            icon={Sparkles} 
            className="border-purple-700/50 hover:border-purple-500/70 transition-colors bg-purple-950/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]" 
            subtitle="Reserva de Magia"
          />
        )}
        <StatItem 
          label="Ataque" 
          value={`+${monster.attack}`} 
          icon={Sword} 
          className="border-blue-800/40 hover:border-blue-600/60 transition-colors" 
          subtitle={monster.tableReference ? `Base: +${monster.tableReference.attack}` : undefined}
        />
        <StatItem 
          label="CD Padrão" 
          value={`CD ${monster.saveDC}`} 
          icon={Zap} 
          className="border-amber-600/40 hover:border-amber-500/60 transition-colors" 
          subtitle={monster.tableReference ? `Base: CD ${monster.tableReference.saveDC}` : undefined}
        />
      </div>

      {/* Dano Médio Alvo & Distribuição */}
      <div className="p-3 rounded bg-stone-900/60 border border-amber-900/30 flex items-center justify-between text-xs font-cinzel">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-amber-400" />
          <span className="text-amber-200/80 font-bold uppercase">Dano Médio da Tabela:</span>
          <strong className="text-amber-300 text-sm">{monster.targetDamage}</strong>
        </div>
        <div className="text-stone-400 text-[11px]">
          Fórmula Estimada: <strong className="text-amber-200">{monster.damage}</strong>
        </div>
      </div>

      {/* 3 Resistências de Tormenta 20 (Forte / Média / Fraca) */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-bold text-amber-400/80 font-cinzel tracking-wider px-1">
          Resistências (Forte • Média • Fraca)
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="flex flex-col items-center justify-center p-2.5 rounded bg-stone-950/80 border border-amber-900/30">
            <span className="text-[9px] uppercase font-bold text-stone-400 font-cinzel">Fortitude</span>
            <span className="text-base font-cinzel font-bold text-amber-200">+{monster.fortitude}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2.5 rounded bg-stone-950/80 border border-amber-900/30">
            <span className="text-[9px] uppercase font-bold text-stone-400 font-cinzel">Reflexos</span>
            <span className="text-base font-cinzel font-bold text-amber-200">+{monster.reflexes}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2.5 rounded bg-stone-950/80 border border-amber-900/30">
            <span className="text-[9px] uppercase font-bold text-stone-400 font-cinzel">Vontade</span>
            <span className="text-base font-cinzel font-bold text-amber-200">+{monster.will}</span>
          </div>
        </div>
      </div>

      {/* Attributes */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-bold text-amber-400/80 font-cinzel tracking-wider px-1">
          Modificadores de Atributo
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <div className="flex flex-col items-center p-2 rounded bg-amber-950/10 border border-amber-900/20">
            <span className="text-[9px] uppercase font-bold text-amber-400/60 font-cinzel">FOR</span>
            <span className="text-sm font-bold text-amber-100">{monster.attributes.str >= 0 ? `+${monster.attributes.str}` : monster.attributes.str}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded bg-amber-950/10 border border-amber-900/20">
            <span className="text-[9px] uppercase font-bold text-amber-400/60 font-cinzel">DES</span>
            <span className="text-sm font-bold text-amber-100">{monster.attributes.dex >= 0 ? `+${monster.attributes.dex}` : monster.attributes.dex}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded bg-amber-950/10 border border-amber-900/20">
            <span className="text-[9px] uppercase font-bold text-amber-400/60 font-cinzel">CON</span>
            <span className="text-sm font-bold text-amber-100">{monster.attributes.con >= 0 ? `+${monster.attributes.con}` : monster.attributes.con}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded bg-amber-950/10 border border-amber-900/20">
            <span className="text-[9px] uppercase font-bold text-amber-400/60 font-cinzel">INT</span>
            <span className="text-sm font-bold text-amber-100">{monster.attributes.int >= 0 ? `+${monster.attributes.int}` : monster.attributes.int}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded bg-amber-950/10 border border-amber-900/20">
            <span className="text-[9px] uppercase font-bold text-amber-400/60 font-cinzel">SAB</span>
            <span className="text-sm font-bold text-amber-100">{monster.attributes.wis >= 0 ? `+${monster.attributes.wis}` : monster.attributes.wis}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded bg-amber-950/10 border border-amber-900/20">
            <span className="text-[9px] uppercase font-bold text-amber-400/60 font-cinzel">CAR</span>
            <span className="text-sm font-bold text-amber-100">{monster.attributes.cha >= 0 ? `+${monster.attributes.cha}` : monster.attributes.cha}</span>
          </div>
        </div>
      </div>

      {/* Movement & Senses */}
      <div className="flex flex-wrap gap-4 text-xs pt-1">
        <div className="flex items-center gap-2 text-stone-300">
          <Wind size={14} className="text-amber-400" />
          <span className="uppercase font-bold text-[9px] tracking-wider text-stone-400 font-cinzel">Deslocamento:</span>
          <span className="font-bold text-amber-200">{monster.speed}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-300">
          <Eye size={14} className="text-amber-400" />
          <span className="uppercase font-bold text-[9px] tracking-wider text-stone-400 font-cinzel">Sentidos:</span>
          <span className="font-bold text-amber-200">{monster.senses}</span>
        </div>
      </div>

      {/* Painel de Auditoria e Rastreabilidade Matemática Oficial */}
      {monster.auditLog && (
        <div className="p-3.5 rounded bg-stone-950/90 border border-amber-900/40 space-y-2.5 text-xs font-cinzel">
          <div className="flex items-center justify-between border-b border-amber-900/30 pb-1.5">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-amber-400" />
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                Auditoria Matemática T20 (Ameaças de Arton)
              </span>
            </div>
            <div className="text-[10px] text-stone-400">
              Escala: <strong className="text-amber-200">{monster.auditLog.escala}</strong> • Papel: <strong className="text-amber-200">{monster.auditLog.papel}</strong> • ND: <strong className="text-amber-200">{monster.auditLog.nd}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="bg-stone-900/70 p-2 rounded border border-stone-800">
              <span className="text-stone-400 block text-[9px]">DEFESA</span>
              <span className="text-amber-200 font-bold">Oficial: {monster.auditLog.parametrosOficiais.defesa}</span>
              <span className="text-stone-500 block text-[8px]">Mod: {monster.auditLog.modificacoesConceituais.defesa.ajuste}</span>
            </div>
            <div className="bg-stone-900/70 p-2 rounded border border-stone-800">
              <span className="text-stone-400 block text-[9px]">PONTOS DE VIDA</span>
              <span className="text-amber-200 font-bold">Oficial: {monster.auditLog.parametrosOficiais.pv} PV</span>
              <span className="text-stone-500 block text-[8px]">Mod: {monster.auditLog.modificacoesConceituais.pv.ajuste}</span>
            </div>
            <div className="bg-stone-900/70 p-2 rounded border border-stone-800">
              <span className="text-stone-400 block text-[9px]">ATAQUE</span>
              <span className="text-amber-200 font-bold">Oficial: +{monster.auditLog.parametrosOficiais.ataque}</span>
              <span className="text-stone-500 block text-[8px]">Mod: {monster.auditLog.modificacoesConceituais.ataque.ajuste}</span>
            </div>
            <div className="bg-stone-900/70 p-2 rounded border border-stone-800">
              <span className="text-stone-400 block text-[9px]">CD PADRÃO</span>
              <span className="text-amber-200 font-bold">Oficial: CD {monster.auditLog.parametrosOficiais.cd}</span>
              <span className="text-stone-500 block text-[8px]">Mod: {monster.auditLog.modificacoesConceituais.cd.ajuste}</span>
            </div>
          </div>

          <div className="text-[9px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-900">
            <span>Resistências Tabela 2-3: Forte (+{monster.auditLog.parametrosOficiais.resistenciaForte}) • Média (+{monster.auditLog.parametrosOficiais.resistenciaMedia}) • Fraca (+{monster.auditLog.parametrosOficiais.resistenciaFraca})</span>
            <span className="text-emerald-400 font-bold">100% Ancorado na Tabela 2-3</span>
          </div>
        </div>
      )}
    </div>
  );
};
