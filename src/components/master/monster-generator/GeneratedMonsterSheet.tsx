
import React from 'react';
import { 
  Sword, 
  Zap, 
  RefreshCw, 
  Save, 
  Edit, 
  Trash2, 
  X, 
  Target, 
  Sparkles, 
  BookOpen, 
  Skull,
  Shield,
  Heart,
  Activity,
  Flame,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../../Button';
import { GeneratedMonster } from '../../../services/monsterGeneratorService';
import { MonsterStatBlock } from './MonsterStatBlock';

interface GeneratedMonsterSheetProps {
  monster: GeneratedMonster;
  onReroll: () => void;
  onSave?: () => void;
  onClose: () => void;
}

export const GeneratedMonsterSheet: React.FC<GeneratedMonsterSheetProps> = ({ monster, onReroll, onSave, onClose }) => {
  return (
    <div className="glass-card border-2 border-gold/40 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
      {/* Header with Background Image/Pattern */}
      <div className="relative h-32 bg-mythos-bg overflow-hidden border-b border-gold/20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-mythos-bg to-transparent" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 border border-gold/10 text-gold/40 hover:text-gold hover:border-gold/40 transition-all"
        >
          <X size={20} />
        </button>

        {/* Title Section */}
        <div className="absolute bottom-4 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-cinzel font-black text-gold-gradient tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {monster.name}
              </h2>
              <div className="px-3 py-1 rounded-sm bg-gold/10 border border-gold/20 text-[10px] text-gold font-black uppercase tracking-[0.2em]">
                ND {monster.nd}
              </div>
            </div>
            <p className="text-gold/80 text-xs uppercase font-bold tracking-[0.25em] flex items-center gap-2">
              <span className="text-amber-400 font-extrabold">{monster.combatRole ? monster.combatRole.toUpperCase() : 'SOLO'}</span>
              <span className="text-gold/30">•</span>
              <span>{monster.type}</span>
              <span className="text-gold/30">•</span>
              <span>{monster.role}</span>
              <span className="text-gold/30">•</span>
              <span>{monster.rank}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Stats & Description */}
        <div className="lg:col-span-7 space-y-10">
          {/* Description Block */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BookOpen size={18} className="text-gold/40" />
              <h3 className="text-lg font-cinzel text-gold/60 tracking-widest uppercase font-bold">Descrição</h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
            </div>
            <div className="space-y-4">
              <p className="text-gold font-cinzel italic text-sm leading-relaxed bg-black/20 p-4 rounded-sm border-l-2 border-gold/20">
                "{monster.description}"
              </p>
              
              {monster.combatProfile && (
                <div className="p-4 rounded-sm bg-gold/5 border border-gold/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-gold" />
                    <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Perfil de Combate: {monster.combatProfile.name}</h4>
                  </div>
                  <p className="text-gold/60 text-[11px] italic leading-relaxed">{monster.combatProfile.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Block */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Target size={18} className="text-gold/40" />
              <h3 className="text-lg font-cinzel text-gold/60 tracking-widest uppercase font-bold">Estatísticas</h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
            </div>
            <MonsterStatBlock monster={monster} />
          </div>

          {/* Attacks Block */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Sword size={18} className="text-gold/40" />
              <h3 className="text-lg font-cinzel text-gold/60 tracking-widest uppercase font-bold">Ações e Ataques</h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
            </div>
            <div className="space-y-3">
              {monster.attacks.map((attack, idx) => (
                <div key={idx} className="p-4 rounded-sm bg-black/40 border border-gold/10 flex items-center justify-between group hover:border-gold/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center text-gold/40 group-hover:text-gold transition-colors shrink-0">
                      <Sword size={18} />
                    </div>
                    <span className="text-gold font-cinzel font-bold whitespace-pre-line text-sm leading-relaxed">{attack}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Rolar Dano</Button>
                </div>
              ))}
            </div>
          </div>

          {/* Magias / Habilidades Mágicas (Para Conjuradores e Especiais Mágicos) */}
          {monster.spells && monster.spells.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-purple-400" />
                  <h3 className="text-lg font-cinzel text-purple-300 tracking-widest uppercase font-bold">
                    ✨ Magias
                  </h3>
                </div>
                {monster.manaPoints !== undefined && (
                  <span className="px-3 py-1 rounded bg-purple-950/80 border border-purple-500/50 text-purple-200 text-xs font-cinzel font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                    Reserva: {monster.manaPoints} PM
                  </span>
                )}
              </div>
              <div className="h-[1px] w-full bg-gradient-to-r from-purple-500/30 to-transparent" />

              <div className="space-y-3">
                {monster.spells.map((spell, idx) => (
                  <div key={idx} className="p-4 rounded bg-purple-950/20 border border-purple-500/25 space-y-2.5 group hover:border-purple-500/50 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-purple-400" />
                        <h4 className="text-purple-200 font-bold font-cinzel text-sm uppercase tracking-wide">
                          {spell.name}
                        </h4>
                        {spell.category && (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-cinzel font-bold uppercase tracking-wider ${
                            spell.category === 'ataque' ? 'bg-red-950/80 text-red-300 border border-red-700/50' :
                            spell.category === 'ofensiva' ? 'bg-orange-950/80 text-orange-300 border border-orange-700/50' :
                            spell.category === 'controle' ? 'bg-amber-950/80 text-amber-300 border border-amber-700/50' :
                            spell.category === 'defesa' ? 'bg-blue-950/80 text-blue-300 border border-blue-700/50' :
                            spell.category === 'suporte' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50' :
                            'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                          }`}>
                            {spell.category}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-cinzel font-bold">
                        <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700/40">
                          {spell.circle}º Círculo ({spell.costPM} PM)
                        </span>
                        <span className="px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-700/40">
                          {spell.school}
                        </span>
                      </div>
                    </div>

                    {/* Destaque Hierárquico: ATAQUE • DANO • CD • CUSTO */}
                    <div className="flex flex-wrap gap-2 text-xs font-cinzel">
                      {spell.attackBonus !== undefined && (
                        <div className="px-2.5 py-1 rounded bg-red-950/50 border border-red-700/50 text-red-200 flex items-center gap-1.5">
                          <span className="font-bold text-red-400 text-[10px] uppercase">🔴 ATAQUE:</span>
                          <span className="font-bold text-red-200">+{spell.attackBonus}</span>
                          {spell.critical && <span className="text-red-400/80 text-[10px]">({spell.critical})</span>}
                        </div>
                      )}
                      {spell.damage && (
                        <div className="px-2.5 py-1 rounded bg-orange-950/50 border border-orange-700/50 text-orange-200 flex items-center gap-1.5">
                          <span className="font-bold text-orange-400 text-[10px] uppercase">🟠 DANO:</span>
                          <span className="font-bold text-orange-200">{spell.damage}</span>
                        </div>
                      )}
                      {spell.resistance && (
                        <div className="px-2.5 py-1 rounded bg-amber-950/50 border border-amber-700/50 text-amber-200 flex items-center gap-1.5">
                          <span className="font-bold text-amber-400 text-[10px] uppercase">🟡 CD:</span>
                          <span className="font-bold text-amber-200">{spell.resistance}</span>
                        </div>
                      )}
                      <div className="px-2.5 py-1 rounded bg-blue-950/50 border border-blue-700/50 text-blue-200 flex items-center gap-1.5">
                        <span className="font-bold text-blue-400 text-[10px] uppercase">🔵 CUSTO:</span>
                        <span className="font-bold text-blue-200">{spell.costPM} PM</span>
                      </div>
                    </div>

                    <p className="text-stone-300 text-xs leading-relaxed italic">{spell.description}</p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-purple-300/80 font-cinzel pt-2 border-t border-purple-900/30">
                      <span><strong>Execução:</strong> {spell.execution}</span>
                      <span>•</span>
                      <span><strong>Alcance:</strong> {spell.range}</span>
                      <span>•</span>
                      <span><strong>Alvo/Área:</strong> {spell.targetOrArea}</span>
                      <span>•</span>
                      <span><strong>Duração:</strong> {spell.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Habilidades Especiais & Características da Criatura */}
          {monster.abilities && monster.abilities.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Zap size={18} className="text-amber-400" />
                <h3 className="text-lg font-cinzel text-amber-300 tracking-widest uppercase font-bold">
                  Habilidades Especiais
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
              </div>
              <div className="space-y-3">
                {monster.abilities.map((ability, idx) => {
                  const [name, desc] = ability.split(': ');
                  return (
                    <div key={idx} className="p-4 rounded bg-stone-900/60 border border-amber-900/30 space-y-1.5 hover:border-amber-700/40 transition-colors">
                      <h4 className="text-amber-200 font-bold font-cinzel text-xs uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={13} className="text-amber-400/80" /> {name}
                      </h4>
                      <p className="text-stone-300 text-xs leading-relaxed italic">{desc || ability}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recursos Exclusivos de Chefe (Regra REALMOR) */}
          {((monster.bossResources && monster.bossResources.length > 0) || (monster.specialActions && monster.specialActions.length > 0)) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap size={18} className="text-red-400" />
                  <h3 className="text-lg font-cinzel text-red-400 tracking-widest uppercase font-bold">
                    Recursos de Chefe (Regra REALMOR)
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-cinzel uppercase font-bold">
                  Mecânica de Boss
                </span>
              </div>
              <div className="h-[1px] w-full bg-gradient-to-r from-red-500/30 to-transparent" />

              <div className="space-y-3">
                {monster.bossResources ? (
                  monster.bossResources.map((res, idx) => (
                    <div key={idx} className="p-4 rounded-sm bg-red-950/20 border border-red-500/20 space-y-2 group hover:bg-red-950/30 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-red-300 font-bold font-cinzel text-sm uppercase tracking-wide flex items-center gap-2">
                          <Zap size={14} className="text-red-400" /> {res.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] font-cinzel font-bold">
                          {res.frequency && (
                            <span className="px-2 py-0.5 rounded bg-red-900/60 text-red-200 border border-red-700/40">
                              {res.frequency}
                            </span>
                          )}
                          {res.trigger && (
                            <span className="px-2 py-0.5 rounded bg-stone-900 text-amber-300 border border-amber-900/40">
                              Gatilho: {res.trigger}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-red-100/80 text-xs leading-relaxed">{res.description}</p>
                    </div>
                  ))
                ) : (
                  monster.specialActions?.map((action, idx) => (
                    <div key={idx} className="p-4 rounded-sm bg-red-500/5 border border-red-500/10 flex items-start gap-4 group hover:bg-red-500/10 transition-all">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500/40 group-hover:text-red-500 transition-colors shrink-0">
                        <Zap size={18} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-red-400 font-cinzel font-bold text-sm">{action.split(': ')[0]}</p>
                        <p className="text-red-200/60 text-xs italic leading-relaxed">{action.split(': ')[1]}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Tactical Lore, Synergies & Combat Guidance */}
        <div className="lg:col-span-5 space-y-8">
          {/* Tactics Block */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skull size={18} className="text-amber-400/80" />
              <h3 className="text-lg font-cinzel text-amber-300 tracking-widest uppercase font-bold">Diretriz Tática</h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
            </div>
            <div className="p-5 rounded bg-stone-900/70 border border-amber-900/30 text-amber-100/90 text-xs leading-relaxed font-cinzel italic">
              {monster.tactics}
            </div>
          </div>

          {/* Weaknesses & Advantages Block */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Flame size={18} className="text-gold/40" />
              <h3 className="text-lg font-cinzel text-gold/60 tracking-widest uppercase font-bold">Fraquezas e Vantagens</h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-red-500/60 tracking-widest">Fraquezas</h4>
                <div className="space-y-1">
                  {monster.weaknesses?.map((w, i) => (
                    <div key={i} className="text-[11px] text-red-400/80 bg-red-500/5 px-2 py-1 rounded-sm border border-red-500/10">
                      • {w}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-emerald-500/60 tracking-widest">Vantagens</h4>
                <div className="space-y-1">
                  {monster.advantages?.map((a, i) => (
                    <div key={i} className="text-[11px] text-emerald-400/80 bg-emerald-500/5 px-2 py-1 rounded-sm border border-emerald-500/10">
                      • {a}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Synergy Block */}
          {monster.synergy && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-gold/40" />
                <h3 className="text-lg font-cinzel text-gold/60 tracking-widest uppercase font-bold">Sinergia de Grupo</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
              </div>
              <div className="p-4 rounded-sm bg-blue-900/10 border border-blue-500/20 space-y-2">
                <h4 className="text-blue-400 font-bold font-cinzel text-xs uppercase tracking-widest">{monster.synergy.name}</h4>
                <p className="text-blue-200/60 text-[10px] italic leading-relaxed">{monster.synergy.description}</p>
                <div className="pt-2 border-t border-blue-500/10">
                  <p className="text-blue-300 text-[11px] font-bold">Efeito: {monster.synergy.effect}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-10 border-t border-gold/10 space-y-4">
            <Button 
              fullWidth 
              icon={Save} 
              onClick={onSave}
              disabled={!onSave}
              className="shadow-[0_0_30px_rgba(212,175,55,0.2)]"
            >
              Salvar no Bestiário
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" fullWidth icon={RefreshCw} onClick={onReroll} className="bg-black/40">Gerar Outro</Button>
              <Button variant="secondary" fullWidth icon={Edit} className="bg-black/40">Editar Ficha</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
