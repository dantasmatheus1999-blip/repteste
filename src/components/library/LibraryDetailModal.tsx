import React, { useEffect } from 'react';
import { 
  X, 
  Heart, 
  Share2, 
  Wand2, 
  Shield, 
  Users, 
  Scroll, 
  Zap, 
  Swords, 
  Sun, 
  Skull, 
  Sparkles,
  BookOpen,
  Flame,
  Clock,
  Crosshair,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  Feather
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UnifiedLibraryItem } from './types';
import { T20Spell } from '../../types/spells';
import { T20ClassDetail } from '../../types/classes';
import { T20RaceDetail } from '../../types/races';
import { T20OriginDetail } from '../../types/origins';
import { T20Power } from '../../types/powers';
import { T20DeityDetail } from '../../types/deities';
import { T20Weapon, T20Armor, T20Shield } from '../../data/t20Equipment';
import { T20MonsterItem } from '../../data/t20MonstersLibrary';

interface LibraryDetailModalProps {
  item: UnifiedLibraryItem | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const LibraryDetailModal: React.FC<LibraryDetailModalProps> = ({
  item,
  onClose,
  isFavorite,
  onToggleFavorite
}) => {
  // Keyboard ESC listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const raw = item.rawItem;

  // Render Category Specific Details
  const renderDetailContent = () => {
    switch (item.categoryId) {
      case 'magias': {
        const spell = raw as T20Spell;
        return (
          <div className="space-y-6">
            {/* Technical Parameters Box */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-900/90 p-4 rounded-xl border border-amber-900/40">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400/80">Execução</span>
                <p className="text-xs sm:text-sm text-stone-200 font-sans font-medium">{spell.execution}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400/80">Alcance</span>
                <p className="text-xs sm:text-sm text-stone-200 font-sans font-medium">{spell.range}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400/80">Duração</span>
                <p className="text-xs sm:text-sm text-stone-200 font-sans font-medium">{spell.duration}</p>
              </div>
              {(spell.target || spell.area || spell.effect) && (
                <div className="space-y-1 col-span-2 sm:col-span-2">
                  <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400/80">Alvo / Área / Efeito</span>
                  <p className="text-xs sm:text-sm text-stone-200 font-sans font-medium">{spell.target || spell.area || spell.effect}</p>
                </div>
              )}
              {spell.resistance && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400/80">Resistência</span>
                  <p className="text-xs sm:text-sm text-stone-200 font-sans font-medium">{spell.resistance}</p>
                </div>
              )}
            </div>

            {/* Spell Description */}
            <div className="space-y-3">
              <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                Descrição do Feitiço
              </h4>
              <div className="text-sm text-stone-300 font-sans leading-relaxed space-y-3">
                {spell.description.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Truque */}
            {spell.truque && (
              <div className="p-3.5 bg-amber-950/30 border-l-3 border-amber-400 rounded-r-lg space-y-1">
                <span className="text-xs font-cinzel font-bold uppercase tracking-wide text-amber-300">
                  Uso como Truque
                </span>
                <p className="text-xs sm:text-sm text-amber-100/90 font-sans">{spell.truque}</p>
              </div>
            )}

            {/* Aprimoramentos */}
            {spell.aprimoramentos && spell.aprimoramentos.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                  Aprimoramentos de Mana
                </h4>
                <div className="space-y-2">
                  {spell.aprimoramentos.map((aprim, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-900/60 border border-amber-900/20 text-xs text-stone-300 font-sans">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <p className="flex-1 leading-relaxed">{aprim}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'classes': {
        const cls = raw as T20ClassDetail;
        return (
          <div className="space-y-6">
            {/* Class Concept */}
            <div className="space-y-2">
              <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                Conceito & Papel
              </h4>
              <p className="text-sm text-stone-300 font-sans leading-relaxed italic">
                "{cls.concept}"
              </p>
              <p className="text-xs text-stone-400 font-sans leading-relaxed">
                {cls.summary}
              </p>
            </div>

            {/* Attributes & Details Box */}
            <div className="grid grid-cols-2 gap-3 bg-stone-900/90 p-4 rounded-xl border border-amber-900/40">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400/80">Atributos Principais</span>
                <p className="text-xs sm:text-sm text-stone-200 font-sans font-bold">{cls.primaryAttributes.join(', ')}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400/80">Atributos Secundários</span>
                <p className="text-xs sm:text-sm text-stone-200 font-sans font-bold">{cls.secondaryAttributes.join(', ')}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400/80">Papel em Grupo</span>
                <p className="text-xs sm:text-sm text-stone-200 font-sans capitalize">{cls.role}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400/80">Dificuldade</span>
                <p className="text-xs sm:text-sm text-stone-200 font-sans capitalize">{cls.difficulty}</p>
              </div>
            </div>

            {/* Class Abilities */}
            {cls.abilities && cls.abilities.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                  Habilidades de Classe
                </h4>
                <div className="space-y-2.5">
                  {cls.abilities.map((ab, idx) => (
                    <div key={idx} className="p-3 bg-stone-900/70 border border-amber-900/30 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel font-bold text-xs sm:text-sm text-amber-200">
                          {ab.name}
                        </span>
                        <span className="text-[10px] font-cinzel uppercase px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-900/40">
                          Nível {ab.level}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 font-sans leading-relaxed">
                        {ab.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'racas': {
        const race = raw as T20RaceDetail;
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="space-y-2">
              <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                Visão Geral
              </h4>
              <p className="text-sm text-stone-300 font-sans leading-relaxed">
                {race.summary}
              </p>
            </div>

            {/* Attribute Modifiers */}
            <div className="p-4 bg-stone-900/90 rounded-xl border border-amber-900/40 space-y-2">
              <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">
                Modificadores de Atributo
              </span>
              <div className="flex flex-wrap gap-2">
                {race.attributeModifiers.map((mod, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/40 text-xs font-cinzel font-bold text-amber-200">
                    {mod.attribute}: {mod.value > 0 ? `+${mod.value}` : mod.value}
                  </span>
                ))}
              </div>
            </div>

            {/* Racial Abilities */}
            {race.racialAbilities && race.racialAbilities.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                  Habilidades Raciais
                </h4>
                <div className="space-y-2.5">
                  {race.racialAbilities.map((ab, idx) => (
                    <div key={idx} className="p-3 bg-stone-900/70 border border-amber-900/30 rounded-lg space-y-1">
                      <span className="font-cinzel font-bold text-xs sm:text-sm text-amber-200 block">
                        {ab.name}
                      </span>
                      <p className="text-xs text-stone-300 font-sans leading-relaxed">
                        {ab.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lore */}
            {race.description && (
              <div className="space-y-2">
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                  Cultura & Costumes
                </h4>
                <p className="text-xs text-stone-400 font-sans leading-relaxed">
                  {race.description}
                </p>
              </div>
            )}
          </div>
        );
      }

      case 'origens': {
        const origin = raw as T20OriginDetail;
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                Histórico
              </h4>
              <p className="text-sm text-stone-300 font-sans leading-relaxed">
                {origin.summary}
              </p>
            </div>

            {/* Starting Items and Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-900/90 p-4 rounded-xl border border-amber-900/40">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Itens Iniciais</span>
                <ul className="text-xs text-stone-300 space-y-1 list-disc list-inside">
                  {origin.startingItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Perícias Treinadas</span>
                <div className="flex flex-wrap gap-1.5">
                  {origin.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-900/40 text-xs text-amber-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Origin Powers */}
            {origin.originPowers && origin.originPowers.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                  Poder Único de Origem
                </h4>
                <div className="space-y-2">
                  {origin.originPowers.map((p, idx) => (
                    <div key={idx} className="p-3 bg-stone-900/70 border border-amber-900/30 rounded-lg space-y-1">
                      <span className="font-cinzel font-bold text-xs sm:text-sm text-amber-200 block">
                        {p.name}
                      </span>
                      <p className="text-xs text-stone-300 font-sans leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'poderes': {
        const power = raw as T20Power;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 bg-stone-900/90 p-4 rounded-xl border border-amber-900/40">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Categoria</span>
                <p className="text-xs sm:text-sm text-stone-200 font-sans font-bold capitalize">{power.category}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Pré-requisito</span>
                <p className="text-xs sm:text-sm text-stone-200 font-sans">{power.prerequisites || 'Nenhum'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                Efeito & Regras
              </h4>
              <p className="text-sm text-stone-300 font-sans leading-relaxed">
                {power.description}
              </p>
            </div>

            {power.tags && power.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {power.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-900 border border-amber-900/30 text-stone-400 font-sans">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'equipamentos': {
        const eq = raw as (T20Weapon | T20Armor | T20Shield);
        const isWeapon = 'damage' in eq;
        const isArmor = 'defenseBonus' in eq && !('crit' in eq);

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-900/90 p-4 rounded-xl border border-amber-900/40">
              {isWeapon && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Dano</span>
                    <p className="text-sm text-stone-100 font-cinzel font-bold">{(eq as T20Weapon).damage}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Crítico</span>
                    <p className="text-sm text-stone-100 font-cinzel font-bold">{(eq as T20Weapon).crit}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Alcance</span>
                    <p className="text-sm text-stone-100 font-sans">{(eq as T20Weapon).range}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Categoria</span>
                    <p className="text-xs text-stone-200 capitalize">{(eq as T20Weapon).category}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Atributo Ataque</span>
                    <p className="text-xs text-stone-200">{(eq as T20Weapon).attrAtaque}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Peso</span>
                    <p className="text-xs text-stone-200">{eq.weight} kg</p>
                  </div>
                </>
              )}

              {isArmor && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Bônus de Defesa</span>
                    <p className="text-sm text-stone-100 font-cinzel font-bold">+{(eq as (T20Armor | T20Shield)).defenseBonus}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Penalidade de Armadura</span>
                    <p className="text-sm text-stone-100 font-cinzel font-bold">{(eq as (T20Armor | T20Shield)).penalty}</p>
                  </div>
                  {'maxDex' in eq && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Destreza Máxima</span>
                      <p className="text-xs text-stone-200">{(eq as T20Armor).maxDex ?? 'Sem limite'}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Peso</span>
                    <p className="text-xs text-stone-200">{eq.weight} kg</p>
                  </div>
                </>
              )}
            </div>

            {eq.properties && eq.properties.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">
                  Propriedades Especiais
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {eq.properties.map((prop, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-amber-950/70 border border-amber-900/40 text-xs font-cinzel text-amber-200">
                      {prop}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'divindades': {
        const deity = raw as T20DeityDetail;
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                O Deus & Seu Domínio
              </h4>
              <p className="text-sm text-stone-300 font-sans leading-relaxed">
                {deity.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-stone-900/90 p-4 rounded-xl border border-amber-900/40">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Canalização</span>
                <p className="text-xs sm:text-sm text-stone-200 font-sans font-bold">{deity.channelDivinity}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Arma Preferida</span>
                <p className="text-xs sm:text-sm text-stone-200 font-sans font-bold">{deity.favoredWeapon}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Símbolo Sagrado</span>
                <p className="text-xs text-stone-300 font-sans">{deity.sacredSymbol}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Devotos Permitidos</span>
                <p className="text-xs text-stone-300 font-sans">{deity.devotees}</p>
              </div>
            </div>

            {/* Obligations and Restrictions */}
            {deity.obligationsAndRestrictions && deity.obligationsAndRestrictions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                  Obrigações & Restrições
                </h4>
                <div className="space-y-2">
                  {deity.obligationsAndRestrictions.map((ob, idx) => (
                    <div key={idx} className="p-3 bg-stone-900/70 border border-amber-900/30 rounded-lg text-xs text-stone-300 font-sans leading-relaxed">
                      {ob}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'monstros': {
        const monster = raw as T20MonsterItem;
        return (
          <div className="space-y-6">
            {/* Monster Stats Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-stone-900/90 p-3.5 rounded-xl border border-amber-900/40 text-center">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-cinzel font-bold text-amber-400">ND</span>
                <p className="text-base font-cinzel font-black text-amber-200">{monster.nd}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-cinzel font-bold text-amber-400">PV</span>
                <p className="text-base font-cinzel font-bold text-rose-400">{monster.hp}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-cinzel font-bold text-amber-400">Defesa</span>
                <p className="text-base font-cinzel font-bold text-blue-400">{monster.defense}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-cinzel font-bold text-amber-400">Iniciativa</span>
                <p className="text-sm font-sans font-bold text-stone-300">+{monster.initiative}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-cinzel font-bold text-amber-400">Percepção</span>
                <p className="text-sm font-sans font-bold text-stone-300">+{monster.perception}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-cinzel font-bold text-amber-400">Desloc.</span>
                <p className="text-xs font-sans text-stone-300 mt-0.5">{monster.speed}</p>
              </div>
            </div>

            {/* Saves */}
            <div className="flex items-center justify-around p-3 bg-stone-900/60 rounded-lg border border-amber-900/20 text-xs font-cinzel">
              <div><span className="text-stone-400">Fortitude:</span> <strong className="text-amber-200">+{monster.fortitude}</strong></div>
              <div><span className="text-stone-400">Reflexos:</span> <strong className="text-amber-200">+{monster.reflexes}</strong></div>
              <div><span className="text-stone-400">Vontade:</span> <strong className="text-amber-200">+{monster.will}</strong></div>
            </div>

            {/* Attacks */}
            {monster.attacks && monster.attacks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                  Ataques
                </h4>
                <div className="space-y-2">
                  {monster.attacks.map((atk, idx) => (
                    <div key={idx} className="p-2.5 bg-stone-900/70 border border-amber-900/30 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-amber-200 font-cinzel text-sm">{atk.name}</strong>
                        <span className="text-stone-400 ml-2">({atk.type})</span>
                        {atk.extra && <p className="text-[11px] text-amber-400/90 font-sans mt-0.5">{atk.extra}</p>}
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 font-bold">
                          +{atk.bonus} ({atk.damage})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Abilities */}
            {monster.abilities && monster.abilities.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900/30 pb-1">
                  Habilidades Especiais
                </h4>
                <div className="space-y-2">
                  {monster.abilities.map((ab, idx) => (
                    <div key={idx} className="p-3 bg-stone-900/70 border border-amber-900/30 rounded-lg space-y-1">
                      <span className="font-cinzel font-bold text-xs sm:text-sm text-amber-200 block">
                        {ab.name}
                      </span>
                      <p className="text-xs text-stone-300 font-sans leading-relaxed">
                        {ab.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window (Grimoire Frame) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-stone-950 border-2 border-amber-500/50 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-amber-900/40 bg-stone-900/90 flex items-start justify-between gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-cinzel font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  {item.categoryId}
                </span>
                {item.badge && (
                  <span className="text-[10px] sm:text-[11px] font-cinzel font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                    {item.badge}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-cinzel font-black text-amber-100 uppercase tracking-wide mt-1.5">
                {item.name}
              </h2>

              <p className="text-xs sm:text-sm font-cinzel text-amber-400/90 tracking-wider mt-0.5">
                {item.subtitle}
              </p>
            </div>

            {/* Actions: Favorite & Close */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onToggleFavorite(item.id)}
                className={`p-2.5 rounded-full transition-all cursor-pointer ${
                  isFavorite 
                    ? 'text-rose-400 bg-rose-950/80 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.4)]' 
                    : 'text-stone-400 hover:text-rose-300 bg-stone-800/80 hover:bg-stone-800 border border-amber-900/40'
                }`}
                title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <Heart size={20} className={isFavorite ? 'fill-rose-400' : ''} />
              </button>

              <button
                onClick={onClose}
                className="p-2.5 rounded-full text-stone-400 hover:text-stone-100 bg-stone-800/80 hover:bg-stone-800 border border-amber-900/40 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
            {renderDetailContent()}
          </div>

          {/* Footer Action */}
          <div className="p-3.5 sm:p-4 border-t border-amber-900/40 bg-stone-900/90 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Fechar Grimório
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
